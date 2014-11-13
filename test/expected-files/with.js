function hello() {
  // DEV: We assert that `a` will change but `b`
  //   will not because it was used in a `with`
  var renamedA = {};
  var b = true;
  with (renamedA) {
  console.log(b);
  }
}
