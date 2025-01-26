console.log("IT’S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const pages = [
  { url: "index.html", title: "Home" },
  { url: "projects/index.html", title: "Projects" },
  { url: "resume.html", title: "Resume" },
  { url: "contact/index.html", title: "Contact" },
  { url: "https://github.com/rohanvasudev1", title: "GitHub" },
];

const ARE_WE_HOME = document.documentElement.classList.contains("home");


const nav = document.createElement("nav");
document.body.prepend(nav);


for (let p of pages) {
  let url = p.url;
  let title = p.title;

  const isAbsoluteUrl = url.startsWith("http");
  

  if (!isAbsoluteUrl) {
    url = ARE_WE_HOME ? `portfolio/${url}` : `../portfolio/${url}`;
  }


  const a = document.createElement("a");
  a.href = url;
  a.textContent = title;


  a.classList.toggle(
    "current",
    a.host === location.host && a.pathname === location.pathname
  );


  if (isAbsoluteUrl) {
    a.target = "_blank";
  }

  
  nav.append(a);
}
