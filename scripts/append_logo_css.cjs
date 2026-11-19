const fs = require('fs');

const cssToAppend = `
/* BloomBiz Techno Hub Brand & Logo System */
.underlay-nav__logo {
  mix-blend-mode: normal !important;
  display: flex !important;
  align-items: center !important;
  width: auto !important;
  max-width: 140px;
}
.brand-logo {
  display: block;
  height: 28px;
  width: auto;
  max-width: 125px;
  object-fit: contain;
  filter: none !important;
}
body[data-page-tone=dark] [data-header-bar] .brand-logo,
[data-menu-status=open] [data-header-bar] .brand-logo {
  filter: none !important;
}
.footer-base__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.75em;
}
.footer-brand-icon {
  display: inline-block;
  height: 18px;
  width: auto;
  vertical-align: middle;
  object-fit: contain;
}
@media screen and (max-width: 767px) {
  .brand-logo {
    height: 24px;
    max-width: 105px;
  }
}
`;

fs.appendFileSync('src/styles/main.css', cssToAppend);
console.log('Successfully appended BloomBiz logo styles to src/styles/main.css');
