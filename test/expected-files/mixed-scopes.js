function hello() {
  var renamedA = true;
  if (true) {
    // DEV: These remain the same name for intention hinting
    let renamedA = false;
  }
}
