function hello() {
  // DEV: We assert that `obj` will change but `world`
  //   will not because it was used in a `with`
  var renamedObj = {};
  var world = true;
  with (renamedObj) {
  console.log(world);
  }
}
