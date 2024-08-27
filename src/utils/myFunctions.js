export const getOptionByVarient = (myVarient) => ({
  variant: myVarient,
  anchorOrigin: {
    vertical: "bottom",
    horizontal: "center",
  },
});

export function extractTextFromHTML(htmlString) {
  const tempElement = document.createElement("div");
  tempElement.innerHTML = htmlString;
  return tempElement.textContent || tempElement.innerText || "";
}
