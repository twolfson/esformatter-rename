function hello() {
  // DEV: We assert that `obj` will change but `world`
  //   will not because it was used in a `with`
  var a = {};
  var world = true;
  with (a) {
    console.log(world);
  }
}
