document.addEventListener("DOMContentLoaded", function() {
    ! function() {
        "use strict";
        var s = localStorage.getItem("language"),
            n = "en";        

        function t() {
            var t = document.querySelectorAll(".counter-value");
            t && t.forEach(function(n) {
                ! function t() {
                    var e = +n.getAttribute("data-target"),
                        a = +n.innerText,
                        s = e / 250;
                    s < 1 && (s = 1), a < e ? (n.innerText = (a + s).toFixed(0), setTimeout(t, 1)) : n.innerText = e
                }()
            })
        }

        function e() {
            setTimeout(function() {
                var t, e, a = document.getElementById("side-menu");
                a && (a = a.querySelector(".mm-active .active"), 300 < (t = a ? a.offsetTop : 0)) && (t -= 100, e = document.getElementsByClassName("vertical-menu") ? document.getElementsByClassName("vertical-menu")[0] : "") && e.querySelector(".simplebar-content-wrapper") && setTimeout(function() {
                    e.querySelector(".simplebar-content-wrapper").scrollTop = t
                }, 0)
            }, 0)
        }

        function a() {
            for (var t = document.getElementById("topnav-menu-content").getElementsByTagName("a"), e = 0, a = t.length; e < a; e++) "nav-item dropdown active" === t[e].parentElement.getAttribute("class") && (t[e].parentElement.classList.remove("active"), t[e].nextElementSibling.classList.remove("show"))
        }

        function l(t) {
            var e = document.getElementById(t),
                a = (e.style.display = "block", setInterval(function() {
                    e.style.opacity || (e.style.opacity = 1), 0 < e.style.opacity ? e.style.opacity -= .2 : (clearInterval(a), e.style.display = "none")
                }, 200))
        }

        function i(t) {
            document.getElementById(t) && (document.getElementById(t).checked = !0)
        }
        window.onload = function() {
            document.getElementById("preloader") && (l("pre-status"), l("preloader"))
        },t();
        for (var d, c, u, m = document.body.getAttribute("data-sidebar-size"), b = (window.onload = function() {
                1024 <= window.innerWidth && window.innerWidth <= 1366 && (document.body.setAttribute("data-sidebar-size", "sm"), i("sidebar-size-small"))
            }, document.getElementsByClassName("vertical-menu-btn")), y = 0; y < b.length; y++) b[d = y] && b[d].addEventListener("click", function(t) {
            t.preventDefault(), document.body.classList.toggle("sidebar-enable"), 992 <= window.innerWidth ? null == m ? null == document.body.getAttribute("data-sidebar-size") || "lg" == document.body.getAttribute("data-sidebar-size") ? document.body.setAttribute("data-sidebar-size", "sm") : document.body.setAttribute("data-sidebar-size", "lg") : "md" == m ? "md" == document.body.getAttribute("data-sidebar-size") ? document.body.setAttribute("data-sidebar-size", "sm") : document.body.setAttribute("data-sidebar-size", "md") : "sm" == document.body.getAttribute("data-sidebar-size") ? document.body.setAttribute("data-sidebar-size", "lg") : document.body.setAttribute("data-sidebar-size", "sm") : e()
        });

        function g() {
            document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement || document.body.classList.remove("fullscreen-enable")
        }
        if (setTimeout(function() {
                var t = document.querySelectorAll("#sidebar-menu a");
                t && t.forEach(function(t) {
                    var e = window.location.href.split(/[?#]/)[0];
                    t.href == e && (t.classList.add("active"), e = t.parentElement) && "side-menu" !== e.id && (e.classList.add("mm-active"), t = e.parentElement) && "side-menu" !== t.id && (t.classList.add("mm-show"), t.classList.contains("mm-collapsing") && console.log("has mm-collapsing"), e = t.parentElement) && "side-menu" !== e.id && (e.classList.add("mm-active"), t = e.parentElement) && "side-menu" !== t.id && (t.classList.add("mm-show"), e = t.parentElement) && "side-menu" !== e.id && e.classList.add("mm-active")
                })
            }, 0), (u = document.querySelectorAll(".navbar-nav a")) && u.forEach(function(t) {
                var e = window.location.href.split(/[?#]/)[0];
                t.href == e && (t.classList.add("active"), e = t.parentElement) && (e.classList.add("active"), (t = e.parentElement).classList.add("active"), e = t.parentElement) && (e.classList.add("active"), (t = e.parentElement).closest("li") && t.closest("li").classList.add("active"), t) && (t.classList.add("active"), e = t.parentElement) && (e.classList.add("active"), t = e.parentElement) && t.classList.add("active")
            }), (u = document.querySelector('[data-toggle="fullscreen"]')) && u.addEventListener("click", function(t) {
                t.preventDefault(), document.body.classList.toggle("fullscreen-enable"), document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement ? document.cancelFullScreen ? document.cancelFullScreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.webkitCancelFullScreen && document.webkitCancelFullScreen() : document.documentElement.requestFullscreen ? document.documentElement.requestFullscreen() : document.documentElement.mozRequestFullScreen ? document.documentElement.mozRequestFullScreen() : document.documentElement.webkitRequestFullscreen && document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
            }), document.addEventListener("fullscreenchange", g), document.addEventListener("webkitfullscreenchange", g), document.addEventListener("mozfullscreenchange", g), document.getElementById("topnav-menu-content")) {
            for (var p = document.getElementById("topnav-menu-content").getElementsByTagName("a"), h = 0, E = p.length; h < E; h++) p[h].onclick = function(t) {
                "#" === t.target.getAttribute("href") && (t.target.parentElement.classList.toggle("active"), t.target.nextElementSibling.classList.toggle("show"))
            };
            window.addEventListener("resize", a)
        } [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map(function(t) {
            return new bootstrap.Tooltip(t)
        }), [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]')).map(function(t) {
            return new bootstrap.Popover(t)
        }), [].slice.call(document.querySelectorAll(".toast")).map(function(t) {
            return new bootstrap.Toast(t)
        }), s && "null" != s && s !== n && o(s), (u = document.getElementsByClassName("language")) && Array.from(u).forEach(function(e) {
            e.addEventListener("click", function(t) {
                o(e.getAttribute("data-lang"))
            })
        }), c = document.body, u = document.getElementsByClassName("right-bar-toggle"), Array.from(u).forEach(function(t) {
            t.addEventListener("click", function(t) {
                c.classList.toggle("right-bar-enabled")
            })
        }), c.addEventListener("click", function(t) {
            !t.target.parentElement.classList.contains("right-bar-toggle-close") && t.target.closest(".right-bar-toggle, .right-bar") || document.body.classList.remove("right-bar-enabled")
        }), (c = document.getElementsByTagName("body")[0]).hasAttribute("data-layout") && "horizontal" == c.getAttribute("data-layout") ? (i("layout-horizontal"), "light" == c.hasAttribute("data-topbar") ? (i("topbar-color-light"), document.body.setAttribute("data-topbar", "light")) : "dark" == c.hasAttribute("data-topbar") && (i("topbar-color-dark"), document.body.setAttribute("data-topbar", "dark")), document.body.removeAttribute("data-sidebar")) : (i("layout-vertical"), c.hasAttribute("data-bs-theme") && "dark" == c.getAttribute("data-bs-theme") ? i("layout-mode-dark") : i("layout-mode-light"), c.hasAttribute("data-layout-size") && "boxed" == c.getAttribute("data-layout-size") ? i("layout-width-boxed") : i("layout-width-fluid"), c.hasAttribute("data-layout-scrollable") && "true" == c.getAttribute("data-layout-scrollable") ? i("layout-position-scrollable") : i("layout-position-fixed"), c.hasAttribute("data-topbar") && "dark" == c.getAttribute("data-topbar") ? i("topbar-color-dark") : i("topbar-color-light"), c.hasAttribute("data-sidebar-size") && "sm" == c.getAttribute("data-sidebar-size") ? i("sidebar-size-small") : c.hasAttribute("data-sidebar-size") && "md" == c.getAttribute("data-sidebar-size") ? i("sidebar-size-compact") : i("sidebar-size-default"), c.hasAttribute("data-sidebar") && "brand" == c.getAttribute("data-sidebar") ? i("sidebar-color-brand") : c.hasAttribute("data-sidebar") && "dark" == c.getAttribute("data-sidebar") ? i("sidebar-color-dark") : i("sidebar-color-light"), document.getElementsByTagName("html")[0].hasAttribute("dir") && "rtl" == document.getElementsByTagName("html")[0].getAttribute("dir") ? i("layout-direction-rtl") : i("layout-direction-ltr"), document.querySelectorAll("input[name='layout'").forEach(function(t) {
            t.addEventListener("change", function(t) {
                t && t.target && "vertical" == t.target.value ? (i("layout-vertical"), i("topbar-color-light"), document.body.setAttribute("data-layout", "vertical"), document.body.setAttribute("data-sidebar", "dark"), document.body.setAttribute("data-topbar", "light"), document.getElementsByClassName("isvertical-topbar")[0].style.display = "block", document.getElementsByClassName("ishorizontal-topbar")[0].style.display = "none", document.getElementsByClassName("vertical-menu")[0].style.display = "block", document.getElementsByClassName("topnav")[0].style.display = "none", window.innerWidth <= 992 && document.getElementsByClassName("vertical-menu")[0].removeAttribute("style"), document.getElementsByClassName("footer")[0].style.display = "none") : (i("layout-horizontal"), i("topbar-color-dark"), document.body.setAttribute("data-topbar", "dark"), document.body.setAttribute("data-layout", "horizontal"), document.body.removeAttribute("data-sidebar"), document.getElementsByClassName("vertical-menu")[0].style.display = "none", document.getElementsByClassName("ishorizontal-topbar")[0].style.display = "block", document.getElementsByClassName("isvertical-topbar")[0].style.display = "none", document.getElementsByClassName("topnav")[0].style.display = "block", document.getElementsByClassName("footer")[0].style.display = "block")
            })
        }), document.querySelectorAll("input[name='layout-mode']").forEach(function(t) {
            t.addEventListener("change", function(t) {
                t && t.target && t.target.value && ("light" == t.target.value ? (document.body.setAttribute("data-bs-theme", "light"), document.body.setAttribute("data-topbar", "light"), document.body.setAttribute("data-sidebar", "light"), c.hasAttribute("data-layout") && "horizontal" == c.getAttribute("data-layout") || document.body.setAttribute("data-sidebar", "light"), i("topbar-color-light"), i("sidebar-color-light")) : (document.body.setAttribute("data-bs-theme", "dark"), document.body.setAttribute("data-topbar", "dark"), document.body.setAttribute("data-sidebar", "dark"), c.hasAttribute("data-layout") && "horizontal" == c.getAttribute("data-layout") || document.body.setAttribute("data-sidebar", "dark"), i("topbar-color-dark"), i("sidebar-color-dark")))
            })
        }), document.querySelectorAll("input[name='layout-direction']").forEach(function(t) {
            t.addEventListener("change", function(t) {
                t && t.target && t.target.value && ("ltr" == t.target.value ? (document.getElementsByTagName("html")[0].removeAttribute("dir"), document.getElementById("bootstrap-style").setAttribute("href", "assets/css/bootstrap.min.css"), document.getElementById("app-style").setAttribute("href", "assets/css/app.min.css"), sessionStorage.setItem("is_visited", "layout-direction-ltr")) : (document.getElementById("bootstrap-style").setAttribute("href", "assets/css/bootstrap-rtl.min.css"), document.getElementById("app-style").setAttribute("href", "assets/css/app-rtl.min.css"), document.getElementsByTagName("html")[0].setAttribute("dir", "rtl"), sessionStorage.setItem("is_visited", "layout-direction-rtl")))
            })
        }), e(), (u = document.getElementById("checkAll")) && (u.onclick = function() {
            for (var t = document.querySelectorAll('.table-check input[type="checkbox"]'), e = 0; e < t.length; e++) t[e].checked = this.checked
        })
    )}();
    var scrollPosition = window.scrollY,
        topbar = document.getElementById("page-topbar");
    window.addEventListener("scroll", function() {
        30 <= (scrollPosition = window.scrollY) ? topbar.classList.add("sticky") : topbar.classList.remove("sticky")
    });
})