import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { login } from "../redux/slices/authSlice";
import { loginUser } from "../services/userService";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  /* ================= REDIRECT LOCATION ================= */

  const from =
    location.state?.from || "/";

  /* ================= FORM STATE ================= */

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  const [formErrors, setFormErrors] =
    useState({});

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  /* ================= VALIDATION ================= */

  const validateForm = () => {
    const errors = {};

    const email =
      formData.email
        .trim()
        .toLowerCase();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      errors.email =
        "Email is required";
    } else if (
      !emailRegex.test(email)
    ) {
      errors.email =
        "Enter a valid email address";
    }

    if (!formData.password) {
      errors.password =
        "Password is required";
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

    if (error) {
      setError("");
    }
  };

  /* =====================================================
     LOGIN
  ===================================================== */

  const handleSubmit = async (e) => {
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
      const email =
        formData.email
          .trim()
          .toLowerCase();

      const password =
        formData.password;

      /* ================= AUTHENTICATE ================= */

      const user =
        await loginUser(
          email,
          password
        );

      /* ================= INVALID CREDENTIALS ================= */

      if (!user) {
        setError(
          "Invalid email or password."
        );

        return;
      }

      /* ================= BLOCKED ACCOUNT ================= */

      if (
        user.isBlocked === true
      ) {
        setError(
          "Your account has been blocked. Please contact support."
        );

        return;
      }

      /* ================= STORE SESSION ================= */

      dispatch(login(user));

      /* =================================================
         ROLE BASED REDIRECT
      ================================================= */

      if (
        user.role === "admin"
      ) {
        navigate(
          "/admin",
          {
            replace: true,
          }
        );

        return;
      }

      /* ================= CUSTOMER REDIRECT ================= */

      navigate(
        from,
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setError(
        "Login failed. Please try again."
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
        py-12
        sm:px-6
      "
    >
      {/* ================= DECORATION ================= */}

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

      {/* ================= CONTAINER ================= */}

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
              Welcome Back
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
              Your setup.
              <br />
              Your gear.
              <br />
              Your NEXORA.
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
              Sign in to access
              your cart, wishlist,
              orders and account.
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

        {/* ================= LOGIN PANEL ================= */}

        <section
          className="
            px-6
            py-10
            sm:px-10
            sm:py-12
            lg:px-14
            lg:py-16
          "
        >
          {/* ================= MOBILE BRAND ================= */}

          <Link
            to="/"
            className="
              mb-10
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
              Account
            </p>

            <h1
              className="
                mt-3
                text-3xl
                font-bold
                tracking-[-0.04em]
                text-nexora-text
                sm:text-4xl
              "
            >
              Sign in
            </h1>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-nexora-muted
              "
            >
              Enter your account
              details to continue
              to NEXORA.
            </p>
          </div>

          {/* ================= FORM ================= */}

          <form
            onSubmit={
              handleSubmit
            }
            noValidate
            className="
              mt-9
              space-y-5
            "
          >
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
                aria-invalid={
                  !!formErrors.email
                }
                aria-describedby={
                  formErrors.email
                    ? "login-email-error"
                    : undefined
                }
                className={
                  formErrors.email
                    ? errorInputClass
                    : inputClass
                }
                placeholder="you@example.com"
              />

              {formErrors.email && (
                <p
                  id="login-email-error"
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
                  autoComplete="current-password"
                  aria-invalid={
                    !!formErrors.password
                  }
                  aria-describedby={
                    formErrors.password
                      ? "login-password-error"
                      : undefined
                  }
                  className={`${
                    formErrors.password
                      ? errorInputClass
                      : inputClass
                  } pr-12`}
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) =>
                        !prev
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  aria-pressed={
                    showPassword
                  }
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
                  {showPassword ? (
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
              </div>

              {formErrors.password && (
                <p
                  id="login-password-error"
                  className={
                    errorTextClass
                  }
                >
                  {
                    formErrors.password
                  }
                </p>
              )}
            </div>

            {/* ================= LOGIN ERROR ================= */}

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

                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* ================= REGISTER ================= */}

          <div
            className="
              mt-8
              border-t
              border-nexora-border
              pt-6
            "
          >
            <p
              className="
                text-center
                text-sm
                text-nexora-muted
              "
            >
              New to NEXORA?{" "}

              <Link
                to="/register"
                state={{ from }}
                className="
                  font-bold
                  text-nexora-primary
                  hover:underline
                "
              >
                Create an account
              </Link>
            </p>
          </div>

          {/* ================= BACK TO STORE ================= */}

          <div className="mt-5 text-center">
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

export default Login;