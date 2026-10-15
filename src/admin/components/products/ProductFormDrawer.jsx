import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import {
  addProductThunk,
  updateProductThunk,
} from "../../../redux/slices/productSlice";

import ProductVariantsEditor from "./ProductVariantsEditor";

/* ================= INITIAL FORM ================= */

const initialFormData = {
  name: "",
  brand: "NEXORA",
  category: "",
  price: "",
  stock: "",
  thumbnail: "",
  description: "",

  returnEligible: true,
  returnWindowDays: 7,

  replacementEligible: false,
  replacementWindowDays: 7,
};

/* ================= COMPONENT ================= */

const ProductFormDrawer = ({
  isOpen,
  onClose,
  product = null,
}) => {
  const dispatch = useDispatch();

  /* =====================================================
     MODE
  ===================================================== */

  const isEditMode = Boolean(product);

  const isVariantProduct = Boolean(
    isEditMode && product?.hasVariants
  );

  /* ================= FORM DATA ================= */

  const [formData, setFormData] = useState(
    initialFormData
  );

  /* ================= IMAGES ================= */

  const [images, setImages] = useState([""]);

  /* ================= SPECIFICATIONS ================= */

  const [specifications, setSpecifications] = useState([
    {
      key: "",
      value: "",
    },
  ]);

  /* ================= VARIANTS ================= */

  const [variants, setVariants] = useState([]);

  /* ================= ERRORS ================= */

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  /* ================= SUBMIT STATE ================= */

  const [submitting, setSubmitting] = useState(false);

  /* =====================================================
     LOAD / RESET FORM
  ===================================================== */

  useEffect(() => {
    if (!isOpen) return;

    setErrors({});
    setSubmitError("");
    setSubmitting(false);

    /* =================================================
       EDIT MODE
    ================================================= */

    if (isEditMode && product) {
      setFormData({
        name: product.name || "",
        brand: product.brand || "NEXORA",
        category: product.category || "",
        price: product.price ?? "",
        stock: product.stock ?? "",
        thumbnail: product.thumbnail || "",
        description: product.description || "",

        /*
         * Legacy products without return policy fields
         * remain returnable by default.
         */

        returnEligible:
          product.returnEligible !== false,

        returnWindowDays:
          Number(product.returnWindowDays) > 0
            ? product.returnWindowDays
            : 7,

        /*
         * Replacement must be explicitly enabled.
         */

        replacementEligible:
          product.replacementEligible === true,

        replacementWindowDays:
          Number(product.replacementWindowDays) > 0
            ? product.replacementWindowDays
            : 7,
      });

      /* ================= GALLERY ================= */

      const galleryImages = Array.isArray(product.images)
        ? product.images.filter(
            (image) =>
              image &&
              image !== product.thumbnail
          )
        : [];

      setImages(
        galleryImages.length > 0
          ? galleryImages
          : [""]
      );

      /* ================= SPECIFICATIONS ================= */

      const specificationRows = Object.entries(
        product.specifications || {}
      ).map(([key, value]) => ({
        key,
        value: String(value),
      }));

      setSpecifications(
        specificationRows.length > 0
          ? specificationRows
          : [
              {
                key: "",
                value: "",
              },
            ]
      );

      /* ================= VARIANTS ================= */

      setVariants(
        Array.isArray(product.variants)
          ? product.variants.map((variant) => ({
              ...variant,

              attributes: {
                ...(variant.attributes || {}),
              },

              /*
               * Existing variants are not new.
               */

              isNew: false,
            }))
          : []
      );

      return;
    }

    /* =================================================
       ADD MODE
    ================================================= */

    setFormData({
      ...initialFormData,
    });

    setImages([""]);

    setSpecifications([
      {
        key: "",
        value: "",
      },
    ]);

    setVariants([]);
  }, [isOpen, isEditMode, product]);

  /* =====================================================
     CLOSE WITH ESCAPE
  ===================================================== */

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, submitting]);

  /* =====================================================
     INPUT CHANGE
  ===================================================== */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }

    if (submitError) {
      setSubmitError("");
    }
  };

  /* =====================================================
     POLICY CHANGE
  ===================================================== */

  const handlePolicyChange = (event) => {
    const { name, checked } = event.target;

    setFormData((previous) => {
      const updated = {
        ...previous,
        [name]: checked,
      };

      /* ================= RETURN ================= */

      if (
        name === "returnEligible" &&
        checked &&
        Number(previous.returnWindowDays) <= 0
      ) {
        updated.returnWindowDays = 7;
      }

      /* ================= REPLACEMENT ================= */

      if (
        name === "replacementEligible" &&
        checked &&
        Number(previous.replacementWindowDays) <= 0
      ) {
        updated.replacementWindowDays = 7;
      }

      return updated;
    });

    setErrors((previous) => ({
      ...previous,

      [name]: "",

      ...(name === "returnEligible"
        ? {
            returnWindowDays: "",
          }
        : {}),

      ...(name === "replacementEligible"
        ? {
            replacementWindowDays: "",
          }
        : {}),
    }));

    if (submitError) {
      setSubmitError("");
    }
  };

  /* =====================================================
     VARIANT CHANGE
  ===================================================== */

  const handleVariantsChange = (updatedVariants) => {
    setVariants(updatedVariants);

    if (errors.variants) {
      setErrors((previous) => ({
        ...previous,
        variants: "",
      }));
    }

    if (submitError) {
      setSubmitError("");
    }
  };

  /* =====================================================
     IMAGE CHANGE
  ===================================================== */

  const handleImageChange = (index, value) => {
    setImages((previous) =>
      previous.map((image, imageIndex) =>
        imageIndex === index ? value : image
      )
    );
  };

  /* ================= ADD IMAGE ================= */

  const addImageField = () => {
    setImages((previous) => [
      ...previous,
      "",
    ]);
  };

  /* ================= REMOVE IMAGE ================= */

  const removeImageField = (index) => {
    setImages((previous) => {
      const updated = previous.filter(
        (_, imageIndex) =>
          imageIndex !== index
      );

      return updated.length > 0
        ? updated
        : [""];
    });
  };

  /* =====================================================
     SPECIFICATIONS
  ===================================================== */

  const handleSpecificationChange = (
    index,
    field,
    value
  ) => {
    setSpecifications((previous) =>
      previous.map(
        (specification, specificationIndex) =>
          specificationIndex === index
            ? {
                ...specification,
                [field]: value,
              }
            : specification
      )
    );
  };

  /* ================= ADD SPECIFICATION ================= */

  const addSpecification = () => {
    setSpecifications((previous) => [
      ...previous,
      {
        key: "",
        value: "",
      },
    ]);
  };

  /* ================= REMOVE SPECIFICATION ================= */

  const removeSpecification = (index) => {
    if (specifications.length === 1) return;

    setSpecifications((previous) =>
      previous.filter(
        (_, specificationIndex) =>
          specificationIndex !== index
      )
    );
  };

  /* =====================================================
     VALIDATION
  ===================================================== */

  const validateForm = () => {
    const newErrors = {};

    /* ================= NAME ================= */

    if (!formData.name.trim()) {
      newErrors.name =
        "Product name is required";
    }

    /* ================= BRAND ================= */

    if (!formData.brand.trim()) {
      newErrors.brand =
        "Brand is required";
    }

    /* ================= CATEGORY ================= */

    if (!formData.category) {
      newErrors.category =
        "Category is required";
    }

    /* ================= PRICE ================= */

    if (
      formData.price === "" ||
      !Number.isFinite(Number(formData.price)) ||
      Number(formData.price) <= 0
    ) {
      newErrors.price =
        "Enter a valid price";
    }

    /* =================================================
       STOCK
    ================================================= */

    if (!isEditMode) {
      const stock = Number(formData.stock);

      if (
        formData.stock === "" ||
        !Number.isFinite(stock) ||
        stock < 0 ||
        !Number.isInteger(stock)
      ) {
        newErrors.stock =
          "Enter a valid stock quantity";
      }
    }

    /* ================= THUMBNAIL ================= */

    if (!formData.thumbnail.trim()) {
      newErrors.thumbnail =
        "Thumbnail is required";
    }

    /* ================= DESCRIPTION ================= */

    if (!formData.description.trim()) {
      newErrors.description =
        "Description is required";
    }

    /* =================================================
       RETURN POLICY
    ================================================= */

    if (formData.returnEligible) {
      const returnWindowDays = Number(
        formData.returnWindowDays
      );

      if (
        !Number.isInteger(returnWindowDays) ||
        returnWindowDays < 1 ||
        returnWindowDays > 365
      ) {
        newErrors.returnWindowDays =
          "Return window must be between 1 and 365 days.";
      }
    }

    /* =================================================
       REPLACEMENT POLICY
    ================================================= */

    if (formData.replacementEligible) {
      const replacementWindowDays = Number(
        formData.replacementWindowDays
      );

      if (
        !Number.isInteger(
          replacementWindowDays
        ) ||
        replacementWindowDays < 1 ||
        replacementWindowDays > 365
      ) {
        newErrors.replacementWindowDays =
          "Replacement window must be between 1 and 365 days.";
      }
    }

    /* =================================================
       VARIANTS
    ================================================= */

    if (isVariantProduct) {
      if (variants.length === 0) {
        newErrors.variants =
          "A variant product must have at least one variant.";
      } else {
        const existingIds = new Set();
        const labels = new Set();
        const configurations = new Set();

        for (const variant of variants) {
          const label =
            variant.label?.trim();

          const ram =
            variant.attributes?.RAM?.trim();

          const storage =
            variant.attributes?.Storage?.trim();

          const price = Number(
            variant.price
          );

          /* ================= LABEL ================= */

          if (!label) {
            newErrors.variants =
              "Every variant requires a label.";

            break;
          }

          /* ================= ATTRIBUTES ================= */

          if (!ram || !storage) {
            newErrors.variants =
              "Every variant requires RAM and Storage.";

            break;
          }

          /* ================= PRICE ================= */

          if (
            !Number.isFinite(price) ||
            price <= 0
          ) {
            newErrors.variants =
              "Every variant requires a valid price.";

            break;
          }

          /* ================= STOCK SAFETY ================= */

          const stock = Number(
            variant.stock
          );

          if (
            !Number.isInteger(stock) ||
            stock < 0
          ) {
            newErrors.variants =
              "Variant stock data is invalid.";

            break;
          }

          /* ================= EXISTING ID ================= */

          if (!variant.isNew) {
            if (!variant.id) {
              newErrors.variants =
                "Existing variant ID is missing.";

              break;
            }

            const id = String(
              variant.id
            );

            if (existingIds.has(id)) {
              newErrors.variants =
                "Duplicate variant IDs are not allowed.";

              break;
            }

            existingIds.add(id);
          }

          /* ================= UNIQUE LABEL ================= */

          const normalizedLabel =
            label.toLowerCase();

          if (
            labels.has(normalizedLabel)
          ) {
            newErrors.variants =
              "Variant labels must be unique.";

            break;
          }

          labels.add(normalizedLabel);

          /* ================= UNIQUE CONFIGURATION ================= */

          const configuration =
            `${ram.toLowerCase()}::${storage.toLowerCase()}`;

          if (
            configurations.has(
              configuration
            )
          ) {
            newErrors.variants =
              "Duplicate RAM and Storage configurations are not allowed.";

            break;
          }

          configurations.add(
            configuration
          );
        }
      }
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  /* =====================================================
     CREATE VARIANT ID
  ===================================================== */

  const createVariantId = (
    productId,
    ram,
    storage
  ) => {
    const createSlug = (value) =>
      value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return `${String(
      productId
    )}-${createSlug(ram)}-${createSlug(
      storage
    )}`;
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    setSubmitError("");

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      /* =================================================
         SPECIFICATIONS OBJECT
      ================================================= */

      const specificationObject =
        specifications.reduce(
          (result, specification) => {
            const key =
              specification.key.trim();

            const value =
              specification.value.trim();

            if (key && value) {
              result[key] = value;
            }

            return result;
          },
          {}
        );

      /* =================================================
         CLEAN GALLERY IMAGES
      ================================================= */

      const cleanedImages = images
        .map((image) => image.trim())
        .filter(Boolean);

      const thumbnail =
        formData.thumbnail.trim();

      /* =================================================
         KEEP THUMBNAIL FIRST
      ================================================= */

      const finalImages = [
        thumbnail,

        ...cleanedImages.filter(
          (image) =>
            image !== thumbnail
        ),
      ];

      /* =================================================
         BASE PRODUCT DATA
      ================================================= */

      const productData = {
        name: formData.name.trim(),

        brand: formData.brand.trim(),

        category: formData.category,

        price: Number(
          formData.price
        ),

        thumbnail,

        images: finalImages,

        description:
          formData.description.trim(),

        specifications:
          specificationObject,

        /* =================================================
           RETURN POLICY
        ================================================= */

        returnEligible: Boolean(
          formData.returnEligible
        ),

        returnWindowDays:
          formData.returnEligible
            ? Number(
                formData.returnWindowDays
              )
            : 0,

        /* =================================================
           REPLACEMENT POLICY
        ================================================= */

        replacementEligible: Boolean(
          formData.replacementEligible
        ),

        replacementWindowDays:
          formData.replacementEligible
            ? Number(
                formData.replacementWindowDays
              )
            : 0,
      };

      /* =================================================
         VARIANT PRODUCT
      ================================================= */

      if (isVariantProduct) {
        if (!product?.id) {
          throw new Error(
            "Product ID is missing"
          );
        }

        const originalVariants =
          Array.isArray(product.variants)
            ? product.variants
            : [];

        const finalVariants =
          variants.map((variant) => {
            const label =
              variant.label.trim();

            const ram =
              variant.attributes.RAM.trim();

            const storage =
              variant.attributes.Storage.trim();

            /* =============================================
               NEW VARIANT
            ============================================= */

            if (variant.isNew) {
              return {
                id: createVariantId(
                  product.id,
                  ram,
                  storage
                ),

                label,

                attributes: {
                  RAM: ram,
                  Storage: storage,
                },

                price: Number(
                  variant.price
                ),

                /*
                 * New variants start with zero stock.
                 * Inventory is added separately.
                 */

                stock: 0,
              };
            }

            /* =============================================
               EXISTING VARIANT
            ============================================= */

            const originalVariant =
              originalVariants.find(
                (original) =>
                  String(original.id) ===
                  String(variant.id)
              );

            if (!originalVariant) {
              throw new Error(
                `Original variant ${variant.id} could not be found.`
              );
            }

            return {
              id: originalVariant.id,

              label,

              attributes: {
                RAM: ram,
                Storage: storage,
              },

              price: Number(
                variant.price
              ),

              /*
               * Preserve authoritative inventory.
               */

              stock: Number(
                originalVariant.stock
              ),
            };
          });

        /* ================= UNIQUE FINAL IDS ================= */

        const finalIds =
          finalVariants.map((variant) =>
            String(variant.id)
          );

        if (
          new Set(finalIds).size !==
          finalIds.length
        ) {
          throw new Error(
            "Variant configuration creates duplicate variant IDs."
          );
        }

        /* ================= PARENT STOCK ================= */

        const calculatedStock =
          finalVariants.reduce(
            (total, variant) =>
              total +
              Number(variant.stock),
            0
          );

        productData.hasVariants = true;

        productData.variants =
          finalVariants;

        productData.stock =
          calculatedStock;
      }

      /* =================================================
         INITIAL STOCK
      ================================================= */

      if (!isEditMode) {
        productData.stock = Number(
          formData.stock
        );
      }

      /* =================================================
         EDIT PRODUCT
      ================================================= */

      if (isEditMode) {
        if (!product?.id) {
          throw new Error(
            "Product ID is missing"
          );
        }

        await dispatch(
          updateProductThunk({
            id: product.id,
            productData,
          })
        ).unwrap();
      } else {
        /* =================================================
           ADD PRODUCT
        ================================================= */

        await dispatch(
          addProductThunk(
            productData
          )
        ).unwrap();
      }

      onClose();
    } catch (error) {
      console.error(
        isEditMode
          ? "Update product error:"
          : "Add product error:",
        error
      );

      setSubmitError(
        typeof error === "string"
          ? error
          : error?.message ||
              (isEditMode
                ? "Failed to update product"
                : "Failed to create product")
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     CLOSED
  ===================================================== */

  if (!isOpen) return null;

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="fixed inset-0 z-50">
      {/* ================= BACKDROP ================= */}

      <button
        type="button"
        aria-label="Close product drawer"
        onClick={() => {
          if (!submitting) {
            onClose();
          }
        }}
        className="absolute inset-0 bg-nexora-primary/45 backdrop-blur-[2px]"
      />

      {/* ================= DRAWER ================= */}

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col border-l border-nexora-border bg-nexora-surface shadow-[-20px_0_60px_rgba(18,63,50,0.14)]">
        {/* ================= HEADER ================= */}

        <div className="flex items-start justify-between gap-5 border-b border-nexora-border bg-nexora-surface px-6 py-5 sm:px-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-7 bg-nexora-taupe" />

              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexora-taupe">
                Catalogue
              </p>
            </div>

            <h2 className="mt-3 text-xl font-black tracking-[-0.025em] text-nexora-text">
              {isEditMode
                ? "Edit Product"
                : "Add Product"}
            </h2>

            <p className="mt-1 text-xs leading-5 text-nexora-muted">
              {isEditMode
                ? "Update product information, pricing, policies, media and specifications."
                : "Create a new NEXORA product listing."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-nexora-border bg-nexora-ivory text-xl text-nexora-muted transition hover:border-nexora-primary/30 hover:bg-nexora-primary-soft hover:text-nexora-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* ================= FORM ================= */}

        <form
          id="product-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto bg-nexora-surface px-6 py-7 sm:px-8"
        >
          <div className="space-y-10">
            {/* =================================================
                BASIC INFORMATION
            ================================================= */}

            <section>
              <SectionHeading
                number="01"
                title="Basic Information"
                description="General information about the product."
              />

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field
                  label="Product Name"
                  error={errors.name}
                  full
                >
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="NEXORA Titan X15"
                    className={inputClass(
                      errors.name
                    )}
                  />
                </Field>

                <Field
                  label="Brand"
                  error={errors.brand}
                >
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="NEXORA"
                    className={inputClass(
                      errors.brand
                    )}
                  />
                </Field>

                <Field
                  label="Category"
                  error={errors.category}
                >
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={inputClass(
                      errors.category
                    )}
                  >
                    <option value="">
                      Select category
                    </option>

                    <option value="Laptops">
                      Laptops
                    </option>

                    <option value="Graphics Cards">
                      Graphics Cards
                    </option>

                    <option value="Processors">
                      Processors
                    </option>

                    <option value="Monitors">
                      Monitors
                    </option>

                    <option value="Keyboards">
                      Keyboards
                    </option>

                    <option value="Mice">
                      Mice
                    </option>

                    <option value="Headsets">
                      Headsets
                    </option>

                    <option value="SSDs">
                      SSDs
                    </option>
                  </select>
                </Field>

                <Field
                  label="Base Price"
                  error={errors.price}
                >
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-medium text-nexora-muted">
                      ₹
                    </span>

                    <input
                      type="number"
                      name="price"
                      min="1"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="89999"
                      className={`${inputClass(
                        errors.price
                      )} pl-8`}
                    />
                  </div>
                </Field>

                <Field
                  label={
                    isEditMode
                      ? isVariantProduct
                        ? "Total Stock"
                        : "Stock"
                      : "Initial Stock"
                  }
                  error={errors.stock}
                >
                  <input
                    type="number"
                    name="stock"
                    min="0"
                    step="1"
                    value={formData.stock}
                    onChange={handleChange}
                    disabled={isEditMode}
                    placeholder="10"
                    className={`${inputClass(
                      errors.stock
                    )} ${
                      isEditMode
                        ? "cursor-not-allowed bg-nexora-taupe-soft/40 text-nexora-muted opacity-75"
                        : ""
                    }`}
                  />

                  {isEditMode && (
                    <p className="mt-1.5 text-[11px] leading-5 text-nexora-muted">
                      {isVariantProduct
                        ? "Total stock is derived from variant inventory and managed from Inventory."
                        : "Stock is managed from Admin Inventory."}
                    </p>
                  )}
                </Field>

                <Field
                  label="Description"
                  error={errors.description}
                  full
                >
                  <textarea
                    name="description"
                    value={
                      formData.description
                    }
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe the product..."
                    className={`${inputClass(
                      errors.description
                    )} resize-none`}
                  />
                </Field>
              </div>
            </section>

            <div className="h-px bg-nexora-border" />

            {/* =================================================
                MEDIA
            ================================================= */}

            <section>
              <SectionHeading
                number="02"
                title="Product Media"
                description="Add the primary product image and gallery images."
              />

              <div className="mt-5 space-y-5">
                <Field
                  label="Thumbnail URL"
                  error={errors.thumbnail}
                >
                  <input
                    type="text"
                    name="thumbnail"
                    value={
                      formData.thumbnail
                    }
                    onChange={handleChange}
                    placeholder="https://..."
                    className={inputClass(
                      errors.thumbnail
                    )}
                  />
                </Field>

                {formData.thumbnail && (
                  <div className="flex items-center gap-4 rounded-xl border border-nexora-border bg-nexora-ivory p-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-nexora-border bg-white">
                      <img
                        src={
                          formData.thumbnail
                        }
                        alt="Product preview"
                        className="h-full w-full object-contain p-1"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-nexora-text">
                        Thumbnail preview
                      </p>

                      <p className="mt-1 text-[11px] text-nexora-muted">
                        Primary product image
                      </p>
                    </div>
                  </div>
                )}

                {/* ================= GALLERY ================= */}

                <div>
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <label className="text-xs font-semibold text-nexora-text">
                      Gallery Images
                    </label>

                    <button
                      type="button"
                      onClick={
                        addImageField
                      }
                      className="text-xs font-bold text-nexora-primary transition hover:text-nexora-primary-hover"
                    >
                      + Add image
                    </button>
                  </div>

                  <div className="space-y-2">
                    {images.map(
                      (image, index) => (
                        <div
                          key={index}
                          className="flex gap-2"
                        >
                          <input
                            type="text"
                            value={image}
                            onChange={(
                              event
                            ) =>
                              handleImageChange(
                                index,
                                event.target
                                  .value
                              )
                            }
                            placeholder="https://..."
                            className={inputClass()}
                          />

                          {images.length >
                            1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeImageField(
                                  index
                                )
                              }
                              aria-label={`Remove gallery image ${
                                index + 1
                              }`}
                              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border border-nexora-border bg-nexora-surface text-nexora-muted transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </section>

            <div className="h-px bg-nexora-border" />

            {/* =================================================
                SPECIFICATIONS
            ================================================= */}

            <section>
              <SectionHeading
                number="03"
                title="Specifications"
                description="Add technical specifications as key and value pairs."
              />

              <div className="mt-5">
                <div className="space-y-2">
                  {specifications.map(
                    (
                      specification,
                      index
                    ) => (
                      <div
                        key={index}
                        className="grid gap-2 sm:grid-cols-[1fr_1.5fr_auto]"
                      >
                        <input
                          type="text"
                          value={
                            specification.key
                          }
                          onChange={(
                            event
                          ) =>
                            handleSpecificationChange(
                              index,
                              "key",
                              event.target
                                .value
                            )
                          }
                          placeholder="e.g. processor"
                          className={inputClass()}
                        />

                        <input
                          type="text"
                          value={
                            specification.value
                          }
                          onChange={(
                            event
                          ) =>
                            handleSpecificationChange(
                              index,
                              "value",
                              event.target
                                .value
                            )
                          }
                          placeholder="e.g. Intel Core i7"
                          className={inputClass()}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeSpecification(
                              index
                            )
                          }
                          disabled={
                            specifications.length ===
                            1
                          }
                          aria-label={`Remove specification ${
                            index + 1
                          }`}
                          className="flex h-[42px] w-[42px] items-center justify-center rounded-lg border border-nexora-border bg-nexora-surface text-nexora-muted transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:bg-nexora-ivory disabled:opacity-40"
                        >
                          ×
                        </button>
                      </div>
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={
                    addSpecification
                  }
                  className="mt-3 text-xs font-bold text-nexora-primary transition hover:text-nexora-primary-hover"
                >
                  + Add specification
                </button>
              </div>
            </section>

            <div className="h-px bg-nexora-border" />

            {/* =================================================
                RETURN & REPLACEMENT POLICY
            ================================================= */}

            <section>
              <SectionHeading
                number="04"
                title="Returns & Replacement Policy"
                description="Control whether customers can return or replace this product after delivery."
              />

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {/* ================= RETURN ================= */}

                <PolicyCard
                  title="Returns"
                  description="Allow customers to return this product for a refund."
                  enabled={
                    formData.returnEligible
                  }
                  name="returnEligible"
                  onChange={
                    handlePolicyChange
                  }
                >
                  <Field
                    label="Return Window"
                    error={
                      errors.returnWindowDays
                    }
                  >
                    <div className="relative">
                      <input
                        type="number"
                        name="returnWindowDays"
                        min="1"
                        max="365"
                        step="1"
                        value={
                          formData.returnWindowDays
                        }
                        onChange={
                          handleChange
                        }
                        className={`${inputClass(
                          errors.returnWindowDays
                        )} pr-14`}
                      />

                      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-medium text-nexora-muted">
                        days
                      </span>
                    </div>
                  </Field>
                </PolicyCard>

                {/* ================= REPLACEMENT ================= */}

                <PolicyCard
                  title="Replacement"
                  description="Allow customers to request the same purchased product and variant as a replacement."
                  enabled={
                    formData.replacementEligible
                  }
                  name="replacementEligible"
                  onChange={
                    handlePolicyChange
                  }
                >
                  <Field
                    label="Replacement Window"
                    error={
                      errors.replacementWindowDays
                    }
                  >
                    <div className="relative">
                      <input
                        type="number"
                        name="replacementWindowDays"
                        min="1"
                        max="365"
                        step="1"
                        value={
                          formData.replacementWindowDays
                        }
                        onChange={
                          handleChange
                        }
                        className={`${inputClass(
                          errors.replacementWindowDays
                        )} pr-14`}
                      />

                      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-medium text-nexora-muted">
                        days
                      </span>
                    </div>
                  </Field>
                </PolicyCard>
              </div>

              {/* ================= POLICY SUMMARY ================= */}

              <div className="mt-4 rounded-xl border border-nexora-border bg-nexora-ivory px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-nexora-primary-soft text-nexora-primary">
                    <PolicyIcon />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-nexora-text">
                      Customer policy
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-nexora-muted">
                      {getPolicySummary(
                        formData
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                VARIANTS
            ================================================= */}

            {isVariantProduct && (
              <>
                <div className="h-px bg-nexora-border" />

                <section>
                  <SectionHeading
                    number="05"
                    title="Product Variants"
                    description="Manage configurations and pricing. Stock quantities remain controlled by Inventory."
                  />

                  <div className="mt-5">
                    <ProductVariantsEditor
                      variants={
                        variants
                      }
                      onChange={
                        handleVariantsChange
                      }
                      error={
                        errors.variants
                      }
                    />
                  </div>
                </section>
              </>
            )}

            {/* =================================================
                SUBMIT ERROR
            ================================================= */}

            {submitError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {submitError}
              </div>
            )}
          </div>
        </form>

        {/* ================= FOOTER ================= */}

        <div className="flex items-center justify-end gap-3 border-t border-nexora-border bg-nexora-ivory/70 px-6 py-4 sm:px-8">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-nexora-border bg-nexora-surface px-5 py-2.5 text-sm font-semibold text-nexora-muted transition hover:border-nexora-primary/20 hover:bg-nexora-primary-soft hover:text-nexora-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="product-form"
            disabled={submitting}
            className="inline-flex min-w-36 items-center justify-center rounded-xl bg-nexora-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(18,63,50,0.16)] transition hover:bg-nexora-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? isEditMode
                ? "Saving..."
                : "Creating..."
              : isEditMode
                ? "Save Changes"
                : "Create Product"}
          </button>
        </div>
      </aside>
    </div>
  );
};

/* =====================================================
   FIELD
===================================================== */

const Field = ({
  label,
  error,
  full = false,
  children,
}) => {
  return (
    <div
      className={
        full
          ? "sm:col-span-2"
          : ""
      }
    >
      <label className="mb-2 block text-xs font-semibold text-nexora-text">
        {label}
      </label>

      {children}

      {error && (
        <p className="mt-1.5 text-[11px] font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

/* =====================================================
   POLICY CARD
===================================================== */

const PolicyCard = ({
  title,
  description,
  enabled,
  name,
  onChange,
  children,
}) => {
  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        enabled
          ? "border-nexora-primary/25 bg-nexora-primary-soft/30"
          : "border-nexora-border bg-nexora-ivory/60"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-nexora-text">
            {title}
          </p>

          <p className="mt-1 text-[11px] leading-5 text-nexora-muted">
            {description}
          </p>
        </div>

        <label className="relative inline-flex shrink-0 cursor-pointer items-center">
          <input
            type="checkbox"
            name={name}
            checked={enabled}
            onChange={onChange}
            className="peer sr-only"
          />

          <span className="h-6 w-11 rounded-full bg-nexora-taupe-soft transition peer-checked:bg-nexora-primary" />

          <span className="absolute left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
        </label>
      </div>

      {enabled && (
        <div className="mt-4 border-t border-nexora-border/70 pt-4">
          {children}
        </div>
      )}
    </div>
  );
};

/* =====================================================
   SECTION HEADING
===================================================== */

const SectionHeading = ({
  number,
  title,
  description,
}) => {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-nexora-primary-soft text-[10px] font-black text-nexora-primary">
        {number}
      </div>

      <div>
        <h3 className="text-sm font-bold text-nexora-text">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-nexora-muted">
          {description}
        </p>
      </div>
    </div>
  );
};

/* =====================================================
   POLICY SUMMARY
===================================================== */

const getPolicySummary = (
  formData
) => {
  const canReturn = Boolean(
    formData.returnEligible
  );

  const canReplace = Boolean(
    formData.replacementEligible
  );

  if (
    canReturn &&
    canReplace
  ) {
    return `Customers can return this product within ${formData.returnWindowDays} days or request the same product and purchased variant as a replacement within ${formData.replacementWindowDays} days after delivery.`;
  }

  if (canReturn) {
    return `Customers can return this product within ${formData.returnWindowDays} days after delivery. Replacement is not available.`;
  }

  if (canReplace) {
    return `Customers can request the same product and purchased variant as a replacement within ${formData.replacementWindowDays} days after delivery. Refund returns are not available.`;
  }

  return "This product is not eligible for returns or replacements.";
};

/* =====================================================
   INPUT STYLE
===================================================== */

const inputClass = (
  error = false
) => `
  w-full
  rounded-lg
  border
  ${
    error
      ? "border-red-300"
      : "border-nexora-border"
  }
  bg-nexora-ivory
  px-4
  py-2.5
  text-sm
  text-nexora-text
  outline-none
  transition
  placeholder:text-nexora-muted/60
  focus:border-nexora-primary/40
  focus:ring-2
  focus:ring-nexora-primary/10
`;

/* =====================================================
   POLICY ICON
===================================================== */

const PolicyIcon = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3 5 6v5c0 4.6 2.8 8 7 10 4.2-2 7-5.4 7-10V6l-7-3Z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9 12 2 2 4-4"
      />
    </svg>
  );
};

export default ProductFormDrawer;