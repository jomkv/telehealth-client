export const extractErrorMessage = (error: unknown): string => {
  const message =
    Array.isArray(error) && error[0]
      ? error[0]
      : typeof error === "string"
        ? error
        : "Something went wrong, please try again later";

  return message;
};
