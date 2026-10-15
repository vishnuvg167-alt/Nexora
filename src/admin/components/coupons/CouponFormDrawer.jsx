import {
  useEffect,
  useState,
} from "react";

const initialFormData = {
  code: "",
  type: "percentage",
  value: "",
  minOrder: "",
  maxDiscount: "",
  expiryDate: "",
  isActive: true,
};

const CouponFormDrawer = ({
  isOpen,
  coupon,
  existingCoupons = [],
  isSaving,
  onSave,
  onClose,
}) => {
  const [
    formData,
    setFormData,
  ] = useState(
    initialFormData
  );

  const [
    formError,
    setFormError,
  ] = useState("");

  /* =====================================================
     ADD / EDIT MODE
  ===================================================== */

  const isEditMode =
    Boolean(coupon);

  /* =====================================================
     PREFILL FORM
  ===================================================== */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormError("");

    if (coupon) {
      setFormData({
        code:
          coupon.code || "",

        type:
          coupon.type ||
          "percentage",

        value:
          coupon.value ?? "",

        minOrder:
          coupon.minOrder ?? "",

        maxDiscount:
          coupon.maxDiscount ??
          "",

        expiryDate:
          coupon.expiryDate
            ? coupon.expiryDate.slice(
                0,
                10
              )
            : "",

        isActive:
          coupon.isActive !==
          false,
      });

      return;
    }

    setFormData(
      initialFormData
    );
  }, [
    coupon,
    isOpen,
  ]);

  /* =====================================================
     INPUT CHANGE
  ===================================================== */

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    );

    setFormError("");
  };

  /* =====================================================
     TYPE CHANGE
  ===================================================== */

  const handleTypeChange = (
    event
  ) => {
    const value =
      event.target.value;

    setFormData(
      (current) => ({
        ...current,

        type: value,

        maxDiscount:
          value === "fixed"
            ? ""
            : current.maxDiscount,
      })
    );

    setFormError("");
  };

  /* =====================================================
     VALIDATION
  ===================================================== */

  const validateForm = () => {
    const normalizedCode =
      formData.code
        .trim()
        .toUpperCase();

    if (!normalizedCode) {
      return "Coupon code is required.";
    }

    if (
      normalizedCode.length <
      3
    ) {
      return "Coupon code must contain at least 3 characters.";
    }

    const duplicateCoupon =
      existingCoupons.find(
        (item) =>
          item.code
            ?.trim()
            .toUpperCase() ===
            normalizedCode &&
          String(item.id) !==
            String(
              coupon?.id
            )
      );

    if (duplicateCoupon) {
      return "A coupon with this code already exists.";
    }

    if (
      ![
        "percentage",
        "fixed",
      ].includes(
        formData.type
      )
    ) {
      return "Invalid coupon type.";
    }

    const discountValue =
      Number(
        formData.value
      );

    if (
      !Number.isFinite(
        discountValue
      ) ||
      discountValue <= 0
    ) {
      return "Discount value must be greater than 0.";
    }

    if (
      formData.type ===
        "percentage" &&
      discountValue > 100
    ) {
      return "Percentage discount cannot exceed 100%.";
    }

    const minimumOrder =
      Number(
        formData.minOrder ||
          0
      );

    if (
      !Number.isFinite(
        minimumOrder
      ) ||
      minimumOrder < 0
    ) {
      return "Minimum order cannot be negative.";
    }

    if (
      formData.type ===
      "percentage"
    ) {
      const maxDiscount =
        Number(
          formData.maxDiscount ||
            0
        );

      if (
        !Number.isFinite(
          maxDiscount
        ) ||
        maxDiscount < 0
      ) {
        return "Maximum discount cannot be negative.";
      }
    }

    if (
      !formData.expiryDate
    ) {
      return "Expiry date is required.";
    }

    const expiryTime =
      new Date(
        `${formData.expiryDate}T23:59:59.999`
      ).getTime();

    if (
      Number.isNaN(
        expiryTime
      )
    ) {
      return "Please enter a valid expiry date.";
    }

    return "";
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      const validationError =
        validateForm();

      if (
        validationError
      ) {
        setFormError(
          validationError
        );

        return;
      }

      const normalizedCode =
        formData.code
          .trim()
          .toUpperCase();

      const couponData = {
        code:
          normalizedCode,

        type:
          formData.type,

        value:
          Number(
            formData.value
          ),

        minOrder:
          Number(
            formData.minOrder ||
              0
          ),

        maxDiscount:
          formData.type ===
          "percentage"
            ? Number(
                formData.maxDiscount ||
                  0
              ) || null
            : null,

        isActive:
          Boolean(
            formData.isActive
          ),

        expiryDate:
          new Date(
            `${formData.expiryDate}T23:59:59.999`
          ).toISOString(),
      };

      try {
        await onSave(
          couponData
        );
      } catch (error) {
        setFormError(
          typeof error ===
            "string"
            ? error
            : error?.message ||
                "Failed to save coupon."
        );
      }
    };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">

      {/* OVERLAY */}

      <button
        type="button"
        aria-label="Close coupon form"
        onClick={
          isSaving
            ? undefined
            : onClose
        }
        className="
          absolute
          inset-0
          h-full
          w-full
          cursor-default
          bg-black/30
          backdrop-blur-[2px]
        "
      />

      {/* DRAWER */}

      <aside
        className="
          absolute
          right-0
          top-0
          flex
          h-full
          w-full
          max-w-lg
          flex-col
          border-l
          border-nexora-border
          bg-nexora-surface
          shadow-2xl
        "
      >
        {/* HEADER */}

        <div
          className="
            flex
            items-start
            justify-between
            gap-4
            border-b
            border-nexora-border
            px-6
            py-6
          "
        >
          <div>
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.2em]
                text-nexora-taupe
              "
            >
              Promotion Management
            </p>

            <h2
              className="
                mt-2
                text-2xl
                font-black
                tracking-[-0.03em]
                text-nexora-text
              "
            >
              {isEditMode
                ? "Edit Coupon"
                : "Add Coupon"}
            </h2>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-nexora-muted
              "
            >
              {isEditMode
                ? "Update the discount rules for this coupon."
                : "Create a new discount code for the NEXORA storefront."}
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              isSaving
            }
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-nexora-border
              text-nexora-muted
              transition
              hover:border-nexora-primary
              hover:bg-nexora-primary
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            aria-label="Close"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* FORM */}

        <form
          onSubmit={
            handleSubmit
          }
          className="
            flex
            min-h-0
            flex-1
            flex-col
          "
        >
          <div
            className="
              flex-1
              space-y-6
              overflow-y-auto
              px-6
              py-6
            "
          >
            {/* CODE */}

            <FormField
              label="Coupon Code"
              required
            >
              <input
                type="text"
                name="code"
                value={
                  formData.code
                }
                onChange={
                  handleChange
                }
                placeholder="NEXORA10"
                autoComplete="off"
                className={inputClass}
              />

              <p className="mt-2 text-xs text-nexora-muted">
                Coupon codes are
                automatically saved
                in uppercase.
              </p>
            </FormField>

            {/* TYPE */}

            <FormField
              label="Discount Type"
              required
            >
              <select
                name="type"
                value={
                  formData.type
                }
                onChange={
                  handleTypeChange
                }
                className={
                  inputClass
                }
              >
                <option value="percentage">
                  Percentage
                </option>

                <option value="fixed">
                  Fixed Amount
                </option>
              </select>
            </FormField>

            {/* VALUE */}

            <FormField
              label={
                formData.type ===
                "percentage"
                  ? "Discount Percentage"
                  : "Discount Amount"
              }
              required
            >
              <div className="relative">
                {formData.type ===
                "fixed" && (
                  <span
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      font-bold
                      text-nexora-muted
                    "
                  >
                    ₹
                  </span>
                )}

                <input
                  type="number"
                  name="value"
                  min="0"
                  step={
                    formData.type ===
                    "percentage"
                      ? "1"
                      : "0.01"
                  }
                  value={
                    formData.value
                  }
                  onChange={
                    handleChange
                  }
                  placeholder={
                    formData.type ===
                    "percentage"
                      ? "10"
                      : "2000"
                  }
                  className={`${inputClass} ${
                    formData.type ===
                    "fixed"
                      ? "pl-9"
                      : ""
                  }`}
                />

                {formData.type ===
                  "percentage" && (
                  <span
                    className="
                      pointer-events-none
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      font-bold
                      text-nexora-muted
                    "
                  >
                    %
                  </span>
                )}
              </div>
            </FormField>

            {/* MIN ORDER */}

            <FormField label="Minimum Order">
              <div className="relative">
                <span
                  className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    font-bold
                    text-nexora-muted
                  "
                >
                  ₹
                </span>

                <input
                  type="number"
                  name="minOrder"
                  min="0"
                  step="1"
                  value={
                    formData.minOrder
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="10000"
                  className={`${inputClass} pl-9`}
                />
              </div>
            </FormField>

            {/* MAX DISCOUNT */}

            {formData.type ===
              "percentage" && (
              <FormField label="Maximum Discount">
                <div className="relative">
                  <span
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      font-bold
                      text-nexora-muted
                    "
                  >
                    ₹
                  </span>

                  <input
                    type="number"
                    name="maxDiscount"
                    min="0"
                    step="1"
                    value={
                      formData.maxDiscount
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="5000"
                    className={`${inputClass} pl-9`}
                  />
                </div>

                <p className="mt-2 text-xs text-nexora-muted">
                  Leave empty if the
                  percentage discount
                  has no maximum cap.
                </p>
              </FormField>
            )}

            {/* EXPIRY */}

            <FormField
              label="Expiry Date"
              required
            >
              <input
                type="date"
                name="expiryDate"
                value={
                  formData.expiryDate
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              />
            </FormField>

            {/* ACTIVE */}

            <label
              className="
                flex
                cursor-pointer
                items-center
                justify-between
                gap-5
                rounded-2xl
                border
                border-nexora-border
                bg-nexora-ivory
                p-4
              "
            >
              <div>
                <p className="text-sm font-bold text-nexora-text">
                  Active Coupon
                </p>

                <p className="mt-1 text-xs leading-5 text-nexora-muted">
                  Customers can use
                  this coupon while it
                  is active and valid.
                </p>
              </div>

              <input
                type="checkbox"
                name="isActive"
                checked={
                  formData.isActive
                }
                onChange={
                  handleChange
                }
                className="
                  h-5
                  w-5
                  accent-nexora-primary
                "
              />
            </label>

            {/* ERROR */}

            {formError && (
              <div
                className="
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                "
              >
                <p className="text-sm font-semibold text-red-700">
                  {formError}
                </p>
              </div>
            )}
          </div>

          {/* FOOTER */}

          <div
            className="
              flex
              gap-3
              border-t
              border-nexora-border
              bg-nexora-ivory/70
              px-6
              py-5
            "
          >
            <button
              type="button"
              onClick={
                onClose
              }
              disabled={
                isSaving
              }
              className="
                flex-1
                rounded-xl
                border
                border-nexora-border
                bg-nexora-surface
                px-5
                py-3
                text-sm
                font-bold
                text-nexora-text
                transition
                hover:border-nexora-taupe
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSaving
              }
              className="
                flex-1
                rounded-xl
                bg-nexora-primary
                px-5
                py-3
                text-sm
                font-bold
                text-white
                transition
                hover:bg-nexora-primary-hover
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {isSaving
                ? "Saving..."
                : isEditMode
                  ? "Save Changes"
                  : "Create Coupon"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
};

const FormField = ({
  label,
  required = false,
  children,
}) => (
  <div>
    <label
      className="
        mb-2
        block
        text-[10px]
        font-bold
        uppercase
        tracking-[0.16em]
        text-nexora-taupe
      "
    >
      {label}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>

    {children}
  </div>
);

const inputClass = `
  h-12
  w-full
  rounded-xl
  border
  border-nexora-border
  bg-nexora-ivory
  px-4
  text-sm
  font-medium
  text-nexora-text
  outline-none
  transition
  placeholder:text-nexora-muted/60
  focus:border-nexora-primary
  focus:ring-2
  focus:ring-nexora-primary/10
`;

export default CouponFormDrawer;