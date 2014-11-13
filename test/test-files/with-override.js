function hello() {
  // DEV: We assert that `obj` will change but `world`
  //   will not because it was used in a `with`
  var a = {};
  var b = true;
  with (a) {
    console.log(b);
  }
}
