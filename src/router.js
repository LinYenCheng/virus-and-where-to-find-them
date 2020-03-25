import Router from "vanilla-router";

var router = new Router({
  mode: "hash",
  page404: function(path) {
    console.log('"/' + path + '" Page not found');
  }
});

router.addUriListener();

export default router;
