function hello() {
  var renamedX = true;
  if (true) {
    // DEV: These remain the same name for intention hinting
    let renamedX = false;
  }
}
