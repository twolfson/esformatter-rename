function hello() {
  var a = true;
  if (true) {
    // DEV: These remain the same name for intention hinting
    let a = false;
  }
}
