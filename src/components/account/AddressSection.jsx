import {
  useEffect,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  fetchAddresses,
  addAddressThunk,
  updateAddressThunk,
  deleteAddressThunk,
  clearAddressError,
} from "../../redux/slices/addressSlice";

import AddressCard from "./AddressCard";
import AddressFormDrawer from "./AddressFormDrawer";

const AddressSection = () => {
  const dispatch = useDispatch();

  const user = useSelector(
    (state) => state.auth.user
  );

  const {
    items,
    loading,
    error,
    saving,
    deletingId,
  } = useSelector(
    (state) => state.addresses
  );

  const [isDrawerOpen, setIsDrawerOpen] =
    useState(false);

  const [
    selectedAddress,
    setSelectedAddress,
  ] = useState(null);

  /* ================= FETCH ================= */

  useEffect(() => {
    if (user?.id) {
      dispatch(
        fetchAddresses(user.id)
      );
    }
  }, [dispatch, user?.id]);

  /* ================= ADD ================= */

  const handleAdd = () => {
    setSelectedAddress(null);

    dispatch(clearAddressError());

    setIsDrawerOpen(true);
  };

  /* ================= EDIT ================= */

  const handleEdit = (address) => {
    setSelectedAddress(address);

    dispatch(clearAddressError());

    setIsDrawerOpen(true);
  };

  /* ================= CLOSE DRAWER ================= */

  const handleCloseDrawer = () => {
    if (saving) {
      return;
    }

    setIsDrawerOpen(false);
    setSelectedAddress(null);

    dispatch(clearAddressError());
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (
    formData
  ) => {
    if (!user?.id) {
      return false;
    }

    try {
      if (selectedAddress) {
        await dispatch(
          updateAddressThunk({
            id: selectedAddress.id,

            addressData: {
              ...formData,
              userId:
                selectedAddress.userId ||
                user.id,

              isDefault:
                Boolean(
                  selectedAddress.isDefault
                ),
            },
          })
        ).unwrap();
      } else {
        /*
          First address automatically becomes
          the user's default address.
        */

        await dispatch(
          addAddressThunk({
            ...formData,
            userId: user.id,
            isDefault:
              items.length === 0,
          })
        ).unwrap();
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (
    address
  ) => {
    const confirmed =
      window.confirm(
        `Delete ${
          address.label || "this"
        } address?`
      );

    if (!confirmed) {
      return;
    }

    try {
      const wasDefault =
        Boolean(address.isDefault);

      await dispatch(
        deleteAddressThunk(
          address.id
        )
      ).unwrap();

      /*
        If the deleted address was the default,
        make another address default.
      */

      if (wasDefault) {
        const remainingAddresses =
          items.filter(
            (item) =>
              String(item.id) !==
              String(address.id)
          );

        if (
          remainingAddresses.length > 0
        ) {
          const nextAddress =
            remainingAddresses[0];

          await dispatch(
            updateAddressThunk({
              id: nextAddress.id,

              addressData: {
                isDefault: true,
              },
            })
          ).unwrap();
        }
      }
    } catch (error) {
      // Redux already stores the error.
    }
  };

  /* ================= SET DEFAULT ================= */

  const handleSetDefault = async (
    address
  ) => {
    if (address.isDefault) {
      return;
    }

    try {
      const currentDefault =
        items.find(
          (item) =>
            item.isDefault &&
            String(item.id) !==
              String(address.id)
        );

      /*
        Remove current default first.
      */

      if (currentDefault) {
        await dispatch(
          updateAddressThunk({
            id: currentDefault.id,

            addressData: {
              isDefault: false,
            },
          })
        ).unwrap();
      }

      /*
        Set selected address as default.
      */

      await dispatch(
        updateAddressThunk({
          id: address.id,

          addressData: {
            isDefault: true,
          },
        })
      ).unwrap();
    } catch (error) {
      /*
        Re-fetch to ensure Redux matches
        JSON Server if one request succeeded
        and another failed.
      */

      if (user?.id) {
        dispatch(
          fetchAddresses(user.id)
        );
      }
    }
  };

  /* ================= UI ================= */

  return (
    <>
      <section className="rounded-3xl border border-nexora-border bg-nexora-surface p-6 shadow-sm sm:p-8">
        {/* HEADER */}

        <div className="flex flex-col gap-4 border-b border-nexora-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nexora-copper">
              Delivery
            </p>

            <h2 className="mt-1 text-xl font-bold text-nexora-text">
              Saved Addresses
            </h2>

            <p className="mt-1 text-sm text-nexora-muted">
              Manage the addresses you
              use during checkout.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="rounded-xl bg-nexora-primary px-5 py-3 text-sm font-semibold text-white hover:bg-nexora-primary-hover"
          >
            + Add address
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div className="py-12 text-center">
            <p className="text-sm text-nexora-muted">
              Loading addresses...
            </p>
          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          items.length === 0 && (
            <div className="py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-nexora-primary-soft text-xl">
                ⌂
              </div>

              <h3 className="mt-4 font-semibold text-nexora-text">
                No saved addresses
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-nexora-muted">
                Add a delivery address
                so checkout can be
                faster next time.
              </p>

              <button
                type="button"
                onClick={handleAdd}
                className="mt-5 text-sm font-semibold text-nexora-primary hover:text-nexora-primary-hover"
              >
                Add your first address
              </button>
            </div>
          )}

        {/* ADDRESS GRID */}

        {!loading &&
          items.length > 0 && (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {items.map(
                (address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    onEdit={
                      handleEdit
                    }
                    onDelete={
                      handleDelete
                    }
                    onSetDefault={
                      handleSetDefault
                    }
                    deleting={
                      String(
                        deletingId
                      ) ===
                      String(
                        address.id
                      )
                    }
                  />
                )
              )}
            </div>
          )}
      </section>

      {/* ================= DRAWER ================= */}

      <AddressFormDrawer
        isOpen={isDrawerOpen}
        onClose={
          handleCloseDrawer
        }
        onSubmit={handleSubmit}
        addressToEdit={
          selectedAddress
        }
        saving={saving}
      />
    </>
  );
};

export default AddressSection;