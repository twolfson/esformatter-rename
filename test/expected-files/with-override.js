function hello() {
  // DEV: We assert that `obj` will change but `world`
  //   will not because it was used in a `with`
  var renamedA = {};
  var renamedB = true;
  with (renamedA) {
  console.log(renamedB);
  }
}
