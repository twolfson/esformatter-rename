function hello() {
  // DEV: We assert that `a` will change but `b`
  //   will not because it was used in a `with`
  var a = {};
  var b = true;
  with (a) {
    console.log(b);
  }
}
