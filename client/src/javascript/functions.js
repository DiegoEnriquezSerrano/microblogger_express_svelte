export function processAjaxData(response, urlPath){
  window.history.pushState({
      "html":response,
      "pageTitle":response.pageTitle
    },
    "",
    urlPath
  );
};