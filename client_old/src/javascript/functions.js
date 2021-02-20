export function processAjaxData(response, urlPath){
  window.history.pushState({
      "html":response,
      "pageTitle":response.pageTitle
    },
    "",
    urlPath
  );
};

export async function isAuthenticated() {
  const user = await fetch('http://localhost:4000/authorization');
  return user;
}