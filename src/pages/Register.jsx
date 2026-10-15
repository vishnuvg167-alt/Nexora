import { useState } from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  registerUser,
  getUserByEmail,
} from "../services/userService";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /* ================= REDIRECT LOCATION ================= */

  const from =
    location.state?.from || "/";

  /* ================= FORM STATE ================= */

  const [
    formData,
    setFormData,
  ] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [
    formErrors,
    setFormErrors,
  ] = useState({});

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /* ================= PASSWORD VISIBILITY ================= */

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  /* ================= VALIDATION ================= */

  const validateForm = () => {
    const errors = {};

    const name =
      formData.name.trim();

    const email =
      formData.email
        .trim()
        .toLowerCase();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    /* ---------- NAME ---------- */

    if (!name) {
      errors.name =
        "Name is required";
    } else if (
      name.length < 3
    ) {
      errors.name =
        "Name must contain at least 3 characters";
    }

    /* ---------- EMAIL ---------- */

    if (!email) {
      errors.email =
        "Email is required";
    } else if (
      !emailRegex.test(email)
    ) {
      errors.email =
        "Enter a valid email address";
    }

    /* ---------- PASSWORD ---------- */

    if (!formData.password) {
      errors.password =
        "Password is required";
    } else if (
      formData.password.length <
      6
    ) {
      errors.password =
        "Password must contain at least 6 characters";
    }

    /* ---------- CONFIRM PASSWORD ---------- */

    if (
      !formData.confirmPassword
    ) {
      errors.confirmPassword =
        "Please confirm your password";
    } else if (
      formData.password !==
      formData.confirmPassword
    ) {
      errors.confirmPassword =
        "Passwords do not match";
    }

    setFormErrors(errors);

    return (
      Object.keys(errors).length ===
      0
    );
  };

  /* ================= INPUT CHANGE ================= */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors(
        (prev) => ({
          ...prev,
          [name]: "",
        })
      );
    }

    if (
      name === "password" &&
      formErrors.confirmPassword
    ) {
      setFormErrors(
        (prev) => ({
          ...prev,
          confirmPassword: "",
        })
      );
    }

    if (error) {
      setError("");
    }
  };

  /* ================= REGISTER ================= */

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      /* ================= CLEAN DATA ================= */

      const cleanedData = {
        name:
          formData.name.trim(),

        email:
          formData.email
            .trim()
            .toLowerCase(),

        password:
          formData.password,

        role: "customer",

        isBlocked: false,
      };

      /* ================= DUPLICATE EMAIL ================= */

      const existingUsers =
        await getUserByEmail(
          cleanedData.email
        );

      if (
        existingUsers.length >
        0
      ) {
        setError(
          "An account with this email already exists."
        );

        return;
      }

      /* ================= CREATE USER ================= */

      await registerUser(
        cleanedData
      );

      /* ================= REDIRECT ================= */

      navigate("/login", {
        replace: true,

        state: {
          from,
        },
      });
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setError(
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= STYLES ================= */

  const inputClass = `
    h-12
    w-full
    rounded-xl
    border
    border-nexora-border
    bg-nexora-ivory
    px-4
    text-sm
    text-nexora-text
    outline-none
    transition
    placeholder:text-nexora-muted
    focus:border-nexora-primary
    focus:ring-2
    focus:ring-nexora-primary/10
  `;

  const errorInputClass = `
    h-12
    w-full
    rounded-xl
    border
    border-red-400
    bg-red-50
    px-4
    text-sm
    text-nexora-text
    outline-none
    transition
    placeholder:text-nexora-muted
    focus:border-red-500
    focus:ring-2
    focus:ring-red-500/10
  `;

  const errorTextClass =
    "mt-2 text-xs font-medium text-red-600";

  /* ================= UI ================= */

  return (
    <main
      className="
        relative
        flex
        min-h-screen
        items-center
        justify-center
        overflow-hidden
        bg-nexora-ivory
        px-5
        py-10
        sm:px-6
      "
    >
      {/* ================= BACKGROUND DECORATION ================= */}

      <div
        className="
          pointer-events-none
          absolute
          -left-32
          -top-32
          h-96
          w-96
          rounded-full
          bg-nexora-primary-soft
          opacity-70
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-40
          -right-32
          h-96
          w-96
          rounded-full
          bg-nexora-copper-soft
          opacity-50
          blur-3xl
        "
      />

      {/* ================= AUTH CONTAINER ================= */}

      <div
        className="
          relative
          z-10
          grid
          w-full
          max-w-5xl
          overflow-hidden
          rounded-[2rem]
          border
          border-nexora-border
          bg-nexora-surface
          shadow-xl
          lg:grid-cols-[0.9fr_1.1fr]
        "
      >
        {/* ================= BRAND PANEL ================= */}

        <section
          className="
            relative
            hidden
            overflow-hidden
            bg-nexora-primary
            p-10
            text-white
            lg:flex
            lg:flex-col
            lg:justify-between
          "
        >
          {/* Decoration */}

          <div
            className="
              absolute
              -bottom-24
              -right-24
              h-72
              w-72
              rounded-full
              border
              border-white/10
            "
          />

          <div
            className="
              absolute
              -bottom-10
              -right-10
              h-48
              w-48
              rounded-full
              border
              border-white/10
            "
          />

          {/* ================= BRAND ================= */}

          <div className="relative">
            <Link
              to="/"
              className="
                inline-flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-white
                  font-black
                  text-nexora-primary
                "
              >
                N
              </div>

              <span
                className="
                  text-xl
                  font-bold
                  tracking-[0.18em]
                "
              >
                NEXORA
              </span>
            </Link>
          </div>

          {/* ================= MESSAGE ================= */}

          <div
            className="
              relative
              my-16
            "
          >
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.22em]
                text-white/60
              "
            >
              Join NEXORA
            </p>

            <h2
              className="
                mt-5
                max-w-sm
                text-4xl
                font-bold
                leading-tight
                tracking-[-0.04em]
              "
            >
              Build your setup.
              <br />
              Save your gear.
              <br />
              Own your experience.
            </h2>

            <p
              className="
                mt-5
                max-w-sm
                text-sm
                leading-7
                text-white/65
              "
            >
              Create your NEXORA
              account to manage your
              cart, wishlist, orders
              and shopping experience
              in one place.
            </p>
          </div>

          <p
            className="
              relative
              text-xs
              text-white/40
            "
          >
            Computer & Gaming Store
          </p>
        </section>

        {/* ================= REGISTER PANEL ================= */}

        <section
          className="
            px-6
            py-9
            sm:px-10
            sm:py-10
            lg:px-14
            lg:py-11
          "
        >
          {/* ================= MOBILE BRAND ================= */}

          <Link
            to="/"
            className="
              mb-7
              inline-flex
              items-center
              gap-2
              lg:hidden
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                bg-nexora-primary
                font-black
                text-white
              "
            >
              N
            </div>

            <span
              className="
                font-bold
                tracking-[0.16em]
                text-nexora-primary
              "
            >
              NEXORA
            </span>
          </Link>

          {/* ================= HEADER ================= */}

          <div>
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.18em]
                text-nexora-taupe
              "
            >
              Create Account
            </p>

            <h1
              className="
                mt-2
                text-3xl
                font-bold
                tracking-[-0.04em]
                text-nexora-text
                sm:text-4xl
              "
            >
              Join NEXORA
            </h1>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-nexora-muted
              "
            >
              Create your account
              and start building your
              next setup.
            </p>
          </div>

          {/* ================= REGISTER FORM ================= */}

          <form
            onSubmit={
              handleSubmit
            }
            noValidate
            className="
              mt-7
              space-y-4
            "
          >
            {/* ================= NAME ================= */}

            <div>
              <label
                htmlFor="name"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-nexora-text
                "
              >
                Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={
                  formData.name
                }
                onChange={
                  handleChange
                }
                autoComplete="name"
                placeholder="Enter your name"
                aria-invalid={
                  !!formErrors.name
                }
                aria-describedby={
                  formErrors.name
                    ? "register-name-error"
                    : undefined
                }
                className={
                  formErrors.name
                    ? errorInputClass
                    : inputClass
                }
              />

              {formErrors.name && (
                <p
                  id="register-name-error"
                  className={
                    errorTextClass
                  }
                >
                  {
                    formErrors.name
                  }
                </p>
              )}
            </div>

            {/* ================= EMAIL ================= */}

            <div>
              <label
                htmlFor="email"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-nexora-text
                "
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={
                  !!formErrors.email
                }
                aria-describedby={
                  formErrors.email
                    ? "register-email-error"
                    : undefined
                }
                className={
                  formErrors.email
                    ? errorInputClass
                    : inputClass
                }
              />

              {formErrors.email && (
                <p
                  id="register-email-error"
                  className={
                    errorTextClass
                  }
                >
                  {
                    formErrors.email
                  }
                </p>
              )}
            </div>

            {/* ================= PASSWORD ================= */}

            <div>
              <label
                htmlFor="password"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-nexora-text
                "
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    formData.password
                  }
                  onChange={
                    handleChange
                  }
                  autoComplete="new-password"
                  placeholder="Create a password"
                  aria-invalid={
                    !!formErrors.password
                  }
                  aria-describedby={
                    formErrors.password
                      ? "register-password-error"
                      : "password-help"
                  }
                  className={`${
                    formErrors.password
                      ? errorInputClass
                      : inputClass
                  } pr-12`}
                />

                <PasswordToggle
                  visible={
                    showPassword
                  }
                  onToggle={() =>
                    setShowPassword(
                      (prev) =>
                        !prev
                    )
                  }
                />
              </div>

              {formErrors.password ? (
                <p
                  id="register-password-error"
                  className={
                    errorTextClass
                  }
                >
                  {
                    formErrors.password
                  }
                </p>
              ) : (
                <p
                  id="password-help"
                  className="
                    mt-2
                    text-xs
                    text-nexora-muted
                  "
                >
                  Use at least 6
                  characters.
                </p>
              )}
            </div>

            {/* ================= CONFIRM PASSWORD ================= */}

            <div>
              <label
                htmlFor="confirmPassword"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-nexora-text
                "
              >
                Confirm Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    formData.confirmPassword
                  }
                  onChange={
                    handleChange
                  }
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  aria-invalid={
                    !!formErrors.confirmPassword
                  }
                  aria-describedby={
                    formErrors.confirmPassword
                      ? "register-confirm-password-error"
                      : undefined
                  }
                  className={`${
                    formErrors.confirmPassword
                      ? errorInputClass
                      : inputClass
                  } pr-12`}
                />

                <PasswordToggle
                  visible={
                    showConfirmPassword
                  }
                  onToggle={() =>
                    setShowConfirmPassword(
                      (prev) =>
                        !prev
                    )
                  }
                />
              </div>

              {formErrors.confirmPassword && (
                <p
                  id="register-confirm-password-error"
                  className={
                    errorTextClass
                  }
                >
                  {
                    formErrors.confirmPassword
                  }
                </p>
              )}
            </div>

            {/* ================= API ERROR ================= */}

            {error && (
              <div
                role="alert"
                className="
                  flex
                  gap-3
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  p-4
                  text-sm
                  leading-5
                  text-red-700
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                  "
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                  />

                  <path d="M12 8v5" />

                  <path d="M12 16h.01" />
                </svg>

                <span>
                  {error}
                </span>
              </div>
            )}

            {/* ================= SUBMIT ================= */}

            <button
              type="submit"
              disabled={loading}
              className="
                flex
                h-12
                w-full
                items-center
                justify-center
                rounded-xl
                bg-nexora-primary
                px-6
                text-sm
                font-bold
                text-white
                shadow-sm
                hover:bg-nexora-primary-hover
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading ? (
                <span
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <span
                    className="
                      h-4
                      w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-white/30
                      border-t-white
                    "
                  />

                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* ================= LOGIN LINK ================= */}

          <div
            className="
              mt-6
              border-t
              border-nexora-border
              pt-5
            "
          >
            <p
              className="
                text-center
                text-sm
                text-nexora-muted
              "
            >
              Already have an
              account?{" "}

              <Link
                to="/login"
                state={{ from }}
                className="
                  font-bold
                  text-nexora-primary
                  hover:underline
                "
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* ================= BACK TO STORE ================= */}

          <div
            className="
              mt-4
              text-center
            "
          >
            <Link
              to="/"
              className="
                text-xs
                font-semibold
                text-nexora-muted
                hover:text-nexora-primary
              "
            >
              ← Back to store
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

/* =====================================================
   PASSWORD TOGGLE
===================================================== */

const PasswordToggle = ({
  visible,
  onToggle,
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={
        visible
          ? "Hide password"
          : "Show password"
      }
      aria-pressed={visible}
      className="
        absolute
        inset-y-0
        right-0
        flex
        w-12
        items-center
        justify-center
        text-nexora-muted
        hover:text-nexora-primary
        focus:outline-none
      "
    >
      {visible ? (
        /* ================= EYE OFF ================= */

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3l18 18"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.6 10.7a2 2 0 0 0 2.7 2.7"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.9 4.2A10.7 10.7 0 0 1 12 4c5.5 0 9 5 9 5a15.5 15.5 0 0 1-3 3.5"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.6 6.6C4.3 8.1 3 10 3 10s3.5 5 9 5c1.2 0 2.3-.2 3.3-.6"
          />
        </svg>
      ) : (
        /* ================= EYE ================= */

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
          />

          <circle
            cx="12"
            cy="12"
            r="2.5"
          />
        </svg>
      )}
    </button>
  );
};

export default Register;