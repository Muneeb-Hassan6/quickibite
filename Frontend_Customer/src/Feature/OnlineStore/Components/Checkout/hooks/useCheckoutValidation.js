import toast from "react-hot-toast";

export function useCheckoutValidation() {
  const handleNameChange = (e, setCustomerName, setErrors) => {
    const cleanVal = e.target.value.replace(/[^a-zA-Z\s]/g, "");
    setCustomerName(cleanVal);

    if (cleanVal.trim().length > 0 && cleanVal.trim().length < 3) {
      setErrors((prev) => ({
        ...prev,
        name: "Name must be at least 3 letters long.",
      }));
    } else {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  const handleMobileChange = (e, setCustomerMobile, setErrors) => {
    const cleanDigits = e.target.value.replace(/\D/g, "").slice(0, 11);
    setCustomerMobile(cleanDigits);

    if (cleanDigits.length > 0) {
      if (!cleanDigits.startsWith("03")) {
        setErrors((prev) => ({
          ...prev,
          mobile: "Mobile number must start with 03 (e.g. 03001234567).",
        }));
      } else if (cleanDigits.length < 11) {
        setErrors((prev) => ({
          ...prev,
          mobile: `Please enter full 11 digits (${cleanDigits.length}/11 entered).`,
        }));
      } else {
        setErrors((prev) => ({ ...prev, mobile: "" }));
      }
    } else {
      setErrors((prev) => ({ ...prev, mobile: "" }));
    }
  };

  const validateForm = ({
    customerName,
    customerMobile,
    orderType,
    houseNo,
    street,
    area,
    tableNumber,
    setErrors,
  }) => {
    const errs = {};

    if (!customerName.trim() || customerName.trim().length < 3) {
      errs.name = "Full name is required (minimum 3 letters).";
    }

    const cleanMobile = customerMobile.replace(/\D/g, "");
    if (!cleanMobile) {
      errs.mobile = "Mobile number is required.";
    } else if (!/^03\d{9}$/.test(cleanMobile)) {
      errs.mobile =
        "Enter a valid 11-digit Pakistani mobile number starting with 03 (e.g. 03001234567).";
    }

    if (orderType === "delivery") {
      if (!houseNo.trim())
        errs.houseNo = "House / Flat / Building No. is required.";
      if (!street.trim()) errs.street = "Street or Block name is required.";
      if (!area.trim()) errs.area = "Area or Landmark is required.";
    }

    if (orderType === "dine_in" && !tableNumber.trim()) {
      errs.tableNumber = "Table selection is required for Dine-in orders.";
    }

    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      const firstErrMsg = Object.values(errs)[0];
      toast.error(firstErrMsg, { id: "validation-toast", duration: 3000 });
      return false;
    }

    return true;
  };

  return {
    handleNameChange,
    handleMobileChange,
    validateForm,
  };
}
