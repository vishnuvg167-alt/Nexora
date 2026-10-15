const CustomerReviews = ({
  reviews,
  reviewsLoading,
  reviewsError,
  submitting,

  averageRating,
  ratingCounts,

  isAuthenticated,
  hasReviewed,

  reviewForm,
  reviewFormErrors,
  reviewSuccess,

  handleReviewChange,
  handleRatingChange,
  handleReviewSubmit,
  handleLoginRedirect,
}) => {
  const totalReviews = reviews.length;

  return (
    <section
      id="customer-reviews"
      className="relative left-1/2 w-screen -translate-x-1/2 bg-nexora-surface"
    >
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:py-32">

        {/* ================= HEADER ================= */}

        <div className="border-b border-nexora-border pb-10">

          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-nexora-taupe" />

            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-nexora-taupe">
              Customer feedback
            </p>
          </div>

          <h2 className="mt-5 text-4xl font-black tracking-[-0.05em] text-nexora-text sm:text-5xl lg:text-6xl">
            Customer Reviews.
          </h2>

        </div>

        {/* ================= LOADING ================= */}

        {reviewsLoading && (
          <div className="py-16 text-center">
            <p className="text-sm text-nexora-muted">
              Loading reviews...
            </p>
          </div>
        )}

        {/* ================= ERROR ================= */}

        {!reviewsLoading &&
          reviewsError && (
            <div className="py-10">
              <p className="text-sm text-red-500">
                {reviewsError}
              </p>
            </div>
          )}

        {!reviewsLoading &&
          !reviewsError && (
            <>

              {/* ================= RATING SUMMARY ================= */}

              <div className="grid gap-12 border-b border-nexora-border py-14 lg:grid-cols-[0.65fr_1fr] lg:gap-20">

                {/* AVERAGE */}

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
                    Overall rating
                  </p>

                  <div className="mt-6 flex items-end gap-3">

                    <span className="text-7xl font-black tracking-[-0.06em] text-nexora-text">
                      {totalReviews > 0
                        ? averageRating.toFixed(
                            1
                          )
                        : "0.0"}
                    </span>

                    <span className="pb-2 text-xl text-nexora-taupe">
                      / 5
                    </span>

                  </div>

                  {/* STARS */}

                  <div className="mt-4 text-xl tracking-[0.15em]">

                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <span
                          key={star}
                          className={
                            star <=
                            Math.round(
                              averageRating
                            )
                              ? "text-nexora-primary"
                              : "text-nexora-primary-soft"
                          }
                        >
                          ★
                        </span>
                      )
                    )}

                  </div>

                  <p className="mt-4 text-sm text-nexora-muted">
                    Based on{" "}
                    {totalReviews}{" "}
                    {totalReviews === 1
                      ? "review"
                      : "reviews"}
                  </p>

                </div>

                {/* ================= RATING BREAKDOWN ================= */}

                <div className="space-y-4">

                  {[5, 4, 3, 2, 1].map(
                    (rating) => {
                      const count =
                        ratingCounts[
                          rating
                        ] || 0;

                      const percentage =
                        totalReviews > 0
                          ? (count /
                              totalReviews) *
                            100
                          : 0;

                      return (
                        <div
                          key={rating}
                          className="grid grid-cols-[35px_1fr_35px] items-center gap-4"
                        >

                          <span className="text-xs font-semibold text-nexora-muted">
                            {rating} ★
                          </span>

                          <div className="h-1 overflow-hidden rounded-full bg-nexora-primary-soft">

                            <div
                              className="h-full rounded-full bg-nexora-primary transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />

                          </div>

                          <span className="text-right text-xs text-nexora-taupe">
                            {count}
                          </span>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

              {/* ================= WRITE REVIEW ================= */}

              <div className="grid gap-12 border-b border-nexora-border py-14 lg:grid-cols-[0.55fr_1fr] lg:gap-20">

                {/* LEFT */}

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
                    Your experience
                  </p>

                  <h3 className="mt-5 text-3xl font-black tracking-[-0.04em] text-nexora-text">
                    Write a review.
                  </h3>

                  <p className="mt-4 max-w-sm text-sm leading-7 text-nexora-muted">
                    Share your
                    experience with this
                    product and help
                    other customers make
                    their decision.
                  </p>

                </div>

                {/* RIGHT */}

                <div>

                  {/* ================= NOT LOGGED IN ================= */}

                  {!isAuthenticated ? (
                    <div className="border border-nexora-border bg-nexora-ivory p-8">

                      <p className="text-sm leading-7 text-nexora-muted">
                        Sign in to share
                        your experience
                        with this product.
                      </p>

                      <button
                        type="button"
                        onClick={
                          handleLoginRedirect
                        }
                        className="mt-6 rounded-full bg-nexora-primary px-7 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-nexora-primary-hover"
                      >
                        Login to Review
                      </button>

                    </div>
                  ) : hasReviewed ? (

                    /* ================= ALREADY REVIEWED ================= */

                    <div className="border border-nexora-border bg-nexora-ivory p-8">

                      <p className="text-sm font-semibold text-nexora-text">
                        You've already
                        reviewed this
                        product.
                      </p>

                      <p className="mt-2 text-sm leading-6 text-nexora-muted">
                        Thank you for
                        sharing your
                        experience.
                      </p>

                    </div>

                  ) : (

                    /* ================= REVIEW FORM ================= */

                    <form
                      onSubmit={
                        handleReviewSubmit
                      }
                      noValidate
                      className="space-y-7"
                    >

                      {/* RATING */}

                      <div>

                        <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-nexora-taupe">
                          Rating
                        </label>

                        <div className="mt-3 flex gap-2">

                          {[1, 2, 3, 4, 5].map(
                            (rating) => (
                              <button
                                key={
                                  rating
                                }
                                type="button"
                                onClick={() =>
                                  handleRatingChange(
                                    rating
                                  )
                                }
                                aria-label={`Rate ${rating} out of 5`}
                                className={`text-2xl transition ${
                                  rating <=
                                  reviewForm.rating
                                    ? "text-nexora-primary"
                                    : "text-nexora-primary-soft hover:text-nexora-taupe"
                                }`}
                              >
                                ★
                              </button>
                            )
                          )}

                        </div>

                        {reviewFormErrors.rating && (
                          <p className="mt-2 text-xs text-red-500">
                            {
                              reviewFormErrors.rating
                            }
                          </p>
                        )}

                      </div>

                      {/* ================= TITLE ================= */}

                      <div>

                        <label
                          htmlFor="review-title"
                          className="text-[10px] font-bold uppercase tracking-[0.25em] text-nexora-taupe"
                        >
                          Review title
                        </label>

                        <input
                          id="review-title"
                          type="text"
                          name="title"
                          value={
                            reviewForm.title
                          }
                          onChange={
                            handleReviewChange
                          }
                          placeholder="Summarize your experience"
                          aria-invalid={
                            !!reviewFormErrors.title
                          }
                          className={`mt-3 w-full border bg-nexora-ivory px-4 py-4 text-sm text-nexora-text outline-none transition placeholder:text-nexora-taupe ${
                            reviewFormErrors.title
                              ? "border-red-400"
                              : "border-nexora-border hover:border-nexora-taupe focus:border-nexora-primary focus:ring-2 focus:ring-nexora-primary/10"
                          }`}
                        />

                        {reviewFormErrors.title && (
                          <p className="mt-2 text-xs text-red-500">
                            {
                              reviewFormErrors.title
                            }
                          </p>
                        )}

                      </div>

                      {/* ================= COMMENT ================= */}

                      <div>

                        <label
                          htmlFor="review-comment"
                          className="text-[10px] font-bold uppercase tracking-[0.25em] text-nexora-taupe"
                        >
                          Your review
                        </label>

                        <textarea
                          id="review-comment"
                          name="comment"
                          value={
                            reviewForm.comment
                          }
                          onChange={
                            handleReviewChange
                          }
                          placeholder="Tell us what you think about the product"
                          rows="5"
                          aria-invalid={
                            !!reviewFormErrors.comment
                          }
                          className={`mt-3 w-full resize-none border bg-nexora-ivory px-4 py-4 text-sm leading-7 text-nexora-text outline-none transition placeholder:text-nexora-taupe ${
                            reviewFormErrors.comment
                              ? "border-red-400"
                              : "border-nexora-border hover:border-nexora-taupe focus:border-nexora-primary focus:ring-2 focus:ring-nexora-primary/10"
                          }`}
                        />

                        {reviewFormErrors.comment && (
                          <p className="mt-2 text-xs text-red-500">
                            {
                              reviewFormErrors.comment
                            }
                          </p>
                        )}

                      </div>

                      {/* SUCCESS */}

                      {reviewSuccess && (
                        <p className="text-sm font-medium text-nexora-primary">
                          {reviewSuccess}
                        </p>
                      )}

                      {/* SUBMIT */}

                      <button
                        type="submit"
                        disabled={
                          submitting
                        }
                        className="rounded-full bg-nexora-primary px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-nexora-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {submitting
                          ? "Submitting..."
                          : "Submit Review"}
                      </button>

                    </form>
                  )}

                </div>

              </div>

              {/* ================= REVIEW LIST ================= */}

              <div className="pt-14">

                <div className="flex items-center justify-between border-b border-nexora-border pb-7">

                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
                    All reviews
                  </p>

                  <span className="text-xs text-nexora-muted">
                    {totalReviews}
                  </span>

                </div>

                {/* EMPTY REVIEWS */}

                {totalReviews === 0 ? (
                  <div className="py-16 text-center">

                    <p className="text-sm text-nexora-muted">
                      No reviews yet. Be
                      the first to review
                      this product.
                    </p>

                  </div>
                ) : (

                  /* ================= REVIEWS ================= */

                  <div>

                    {reviews.map(
                      (review) => (
                        <article
                          key={
                            review.id
                          }
                          className="grid gap-6 border-b border-nexora-border py-10 sm:grid-cols-[180px_1fr] sm:gap-12"
                        >

                          {/* REVIEWER */}

                          <div>

                            <p className="text-sm font-bold text-nexora-text">
                              {review.userName ||
                                review.name ||
                                "NEXORA Customer"}
                            </p>

                            <div className="mt-2 text-xs tracking-[0.08em]">

                              {Array.from(
                                {
                                  length: 5,
                                },
                                (
                                  _,
                                  index
                                ) => (
                                  <span
                                    key={
                                      index
                                    }
                                    className={
                                      index <
                                      review.rating
                                        ? "text-nexora-primary"
                                        : "text-nexora-primary-soft"
                                    }
                                  >
                                    ★
                                  </span>
                                )
                              )}

                            </div>

                            {review.createdAt && (
                              <p className="mt-3 text-[10px] text-nexora-taupe">

                                {new Date(
                                  review.createdAt
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "numeric",
                                    month:
                                      "short",
                                    year: "numeric",
                                  }
                                )}

                              </p>
                            )}

                          </div>

                          {/* REVIEW CONTENT */}

                          <div>

                            <h4 className="text-lg font-bold tracking-[-0.02em] text-nexora-text">
                              {
                                review.title
                              }
                            </h4>

                            <p className="mt-4 max-w-3xl text-sm leading-7 text-nexora-muted">
                              {
                                review.comment
                              }
                            </p>

                          </div>

                        </article>
                      )
                    )}

                  </div>
                )}

              </div>

            </>
          )}

      </div>
    </section>
  );
};

export default CustomerReviews;