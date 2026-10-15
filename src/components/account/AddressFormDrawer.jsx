import {
  useEffect,
  useState,
} from "react";

/* ================= INITIAL FORM ================= */

const initialFormData = {
  label: "Home",
  name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

/* ================= COMPONENT ================= */

const AddressFormDrawer = ({
  isOpen,
  onClose,
  onSubmit,
  addressToEdit = null,
  saving = false,
}) => {
  const [formData, setFormData] =
    useState(initialFormData);

  const [errors, setErrors] =
    useState({});

  /* ================= EDIT / RESET FORM ================= */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (addressToEdit) {
      setFormData({
        label:
          addressToEdit.label || "Home",
        name:
          addressToEdit.name || "",
        phone:
          addressToEdit.phone || "",
        address:
          addressToEdit.address || "",
        city:
          addressToEdit.city || "",
        state:
          addressToEdit.state || "",
        pincode:
          addressToEdit.pincode || "",
      });
    } else {
      setFormData(initialFormData);
    }

    setErrors({});
  }, [isOpen, addressToEdit]);

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  /* ================= VALIDATION ================= */

  const validateForm = () => {
    const newErrors = {};

    if (!formData.label.trim()) {
      newErrors.label =
        "Address label is required.";
    }

    if (!formData.name.trim()) {
      newErrors.name =
        "Full name is required.";
    }

    if (!/^[0-9]{10}$/.test(
      formData.phone.trim()
    )) {
      newErrors.phone =
        "Enter a valid 10-digit phone number.";
    }

    if (!formData.address.trim()) {
      newErrors.address =
        "Address is required.";
    }

    if (!formData.city.trim()) {
      newErrors.city =
        "City is required.";
    }

    if (!formData.state.trim()) {
      newErrors.state =
        "State is required.";
    }

    if (!/^[1-9][0-9]{5}$/.test(
      formData.pincode.trim()
    )) {
      newErrors.pincode =
        "Enter a valid 6-digit pincode.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const success =
      await onSubmit({
        label:
          formData.label.trim(),
        name:
          formData.name.trim(),
        phone:
          formData.phone.trim(),
        address:
          formData.address.trim(),
        city:
          formData.city.trim(),
        state:
          formData.state.trim(),
        pincode:
          formData.pincode.trim(),
      });

    if (success) {
      onClose();
    }
  };

  /* ================= CLOSE ================= */

  const handleClose = () => {
    if (saving) {
      return;
    }

    setErrors({});
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  const isEditing =
    Boolean(addressToEdit);

  /* ================= INPUT STYLE ================= */

  const inputClass = `
    w-full rounded-xl border border-nexora-border
    bg-white px-4 py-3 text-sm text-nexora-text
    outline-none transition
    placeholder:text-nexora-muted
    focus:border-nexora-primary
    focus:ring-2
    focus:ring-nexora-primary/10
  `;

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-50">
      {/* BACKDROP */}

      <button
        type="button"
        aria-label="Close address form"
        onClick={handleClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* DRAWER */}

      <aside className="absolute right-0 top-0 h-full w-full max-w-lg overflow-y-auto bg-nexora-surface shadow-2xl">
        {/* HEADER */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-nexora-border bg-nexora-surface px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nexora-copper">
              Saved Address
            </p>

            <h2 className="mt-1 text-xl font-bold text-nexora-text">
              {isEditing
                ? "Edit address"
                : "Add new address"}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-nexora-border text-xl text-nexora-muted hover:bg-nexora-ivory disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          {/* LABEL */}

          <div>
            <label
              htmlFor="address-label"
              className="mb-2 block text-sm font-semibold text-nexora-text"
            >
              Address label
            </label>

            <input
              id="address-label"
              type="text"
              name="label"
              value={formData.label}
              onChange={handleChange}
              placeholder="Home, Office, etc."
              className={inputClass}
            />

            {errors.label && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.label}
              </p>
            )}
          </div>

          {/* NAME */}

          <div>
            <label
              htmlFor="address-name"
              className="mb-2 block text-sm font-semibold text-nexora-text"
            >
              Full name
            </label>

            <input
              id="address-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              autoComplete="name"
              className={inputClass}
            />

            {errors.name && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          {/* PHONE */}

          <div>
            <label
              htmlFor="address-phone"
              className="mb-2 block text-sm font-semibold text-nexora-text"
            >
              Phone number
            </label>

            <input
              id="address-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              autoComplete="tel"
              inputMode="numeric"
              maxLength={10}
              className={inputClass}
            />

            {errors.phone && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.phone}
              </p>
            )}
          </div>

          {/* STREET ADDRESS */}

          <div>
            <label
              htmlFor="address-line"
              className="mb-2 block text-sm font-semibold text-nexora-text"
            >
              Address
            </label>

            <textarea
              id="address-line"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="House name, building, street, area"
              autoComplete="street-address"
              rows={4}
              className={`${inputClass} resize-none`}
            />

            {errors.address && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.address}
              </p>
            )}
          </div>

          {/* CITY + STATE */}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="address-city"
                className="mb-2 block text-sm font-semibold text-nexora-text"
              >
                City
              </label>

              <input
                id="address-city"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                autoComplete="address-level2"
                className={inputClass}
              />

              {errors.city && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.city}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="address-state"
                className="mb-2 block text-sm font-semibold text-nexora-text"
              >
                State
              </label>

              <input
                id="address-state"
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                autoComplete="address-level1"
                className={inputClass}
              />

              {errors.state && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.state}
                </p>
              )}
            </div>
          </div>

          {/* PINCODE */}

          <div>
            <label
              htmlFor="address-pincode"
              className="mb-2 block text-sm font-semibold text-nexora-text"
            >
              Pincode
            </label>

            <input
              id="address-pincode"
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="6-digit pincode"
              autoComplete="postal-code"
              inputMode="numeric"
              maxLength={6}
              className={inputClass}
            />

            {errors.pincode && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.pincode}
              </p>
            )}
          </div>

          {/* ACTIONS */}

          <div className="flex flex-col-reverse gap-3 border-t border-nexora-border pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="rounded-xl border border-nexora-border px-5 py-3 text-sm font-semibold text-nexora-text hover:bg-nexora-ivory disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-nexora-primary px-5 py-3 text-sm font-semibold text-white hover:bg-nexora-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Add address"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
};

export default AddressFormDrawer;