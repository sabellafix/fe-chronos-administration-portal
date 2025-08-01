document.addEventListener("DOMContentLoaded", function() {
    !function(t, e) {
        "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : (t = "undefined" != typeof globalThis ? globalThis : t || self).MetisMenu = e()
    }(this, (function() {
        "use strict";
        const t = {
            parentTrigger: "li",
            subMenu: "ul",
            toggle: !0,
            triggerElement: "a"
        }
        , e = {
            ACTIVE: "mm-active",
            COLLAPSE: "mm-collapse",
            COLLAPSED: "mm-collapsed",
            COLLAPSING: "mm-collapsing",
            METIS: "metismenu",
            SHOW: "mm-show"
        };
        class s {
            constructor(e, i) {
                this.element = s.isElement(e) ? e : document.querySelector(e),
                this.config = Object.assign(Object.assign({}, t), i),
                this.disposed = !1,
                this.triggerArr = [],
                this.boundEventHandler = this.clickEvent.bind(this),
                this.init()
            }
            static attach(t, e) {
                return new s(t,e)
            }
            init() {
                const {METIS: t, ACTIVE: s, COLLAPSE: i} = e;
                this.element.classList.add(t);
                const n = [...this.element.querySelectorAll(this.config.subMenu)];
                0 !== n.length && n.forEach((t => {
                    t.classList.add(i);
                    const e = t.closest(this.config.parentTrigger);
                    (null == e ? void 0 : e.classList.contains(s)) ? this.show(t) : this.hide(t);
                    const n = null == e ? void 0 : e.querySelector(this.config.triggerElement);
                    "true" !== (null == n ? void 0 : n.getAttribute("aria-disabled")) && (null == n || n.setAttribute("aria-expanded", "false"),
                    null == n || n.addEventListener("click", this.boundEventHandler),
                    this.triggerArr.push(n))
                }
                ))
            }
            clickEvent(t) {
                if (!this.disposed) {
                    const e = null == t ? void 0 : t.currentTarget;
                    e && "A" === e.tagName && t.preventDefault();
                    const s = e.closest(this.config.parentTrigger)
                    , i = null == s ? void 0 : s.querySelector(this.config.subMenu);
                    this.toggle(i)
                }
            }
            update() {
                this.disposed = !1,
                this.init()
            }
            dispose() {
                this.triggerArr.forEach((t => {
                    t.removeEventListener("click", this.boundEventHandler)
                }
                )),
                this.disposed = !0
            }
            on(t, e, s) {
                return this.element.addEventListener(t, e, s),
                this
            }
            off(t, e, s) {
                return this.element.removeEventListener(t, e, s),
                this
            }
            emit(t, e, s=!1) {
                const i = new CustomEvent(t,{
                    bubbles: s,
                    detail: e
                });
                this.element.dispatchEvent(i)
            }
            toggle(t) {
                const s = t.closest(this.config.parentTrigger);
                (null == s ? void 0 : s.classList.contains(e.ACTIVE)) ? this.hide(t) : this.show(t)
            }
            show(t) {
                var s;
                const i = t
                , {ACTIVE: n, COLLAPSE: l, COLLAPSED: o, COLLAPSING: r, SHOW: c} = e;
                if (this.isTransitioning || i.classList.contains(r))
                    return;
                const a = () => {
                    i.classList.remove(r),
                    i.style.height = "",
                    i.removeEventListener("transitionend", a),
                    this.setTransitioning(!1),
                    this.emit("shown.metisMenu", {
                        shownElement: i
                    })
                }
                , h = i.closest(this.config.parentTrigger);
                null == h || h.classList.add(n);
                const d = null == h ? void 0 : h.querySelector(this.config.triggerElement);
                null == d || d.setAttribute("aria-expanded", "true"),
                null == d || d.classList.remove(o),
                i.style.height = "0px",
                i.classList.remove(l),
                i.classList.remove(c),
                i.classList.add(r);
                const g = [].slice.call(null === (s = null == h ? void 0 : h.parentNode) || void 0 === s ? void 0 : s.children).filter((t => t !== h));
                this.config.toggle && g.length > 0 && g.forEach((t => {
                    const e = t.querySelector(this.config.subMenu);
                    e && this.hide(e)
                }
                )),
                this.setTransitioning(!0),
                i.classList.add(l),
                i.classList.add(c),
                i.style.height = `${i.scrollHeight}px`,
                this.emit("show.metisMenu", {
                    showElement: i
                }),
                i.addEventListener("transitionend", a)
            }
            hide(t) {
                const {ACTIVE: s, COLLAPSE: i, COLLAPSED: n, COLLAPSING: l, SHOW: o} = e
                , r = t;
                if (this.isTransitioning || !r.classList.contains(o))
                    return;
                this.emit("hide.metisMenu", {
                    hideElement: r
                });
                const c = r.closest(this.config.parentTrigger);
                null == c || c.classList.remove(s);
                const a = () => {
                    r.classList.remove(l),
                    r.classList.add(i),
                    r.style.height = "",
                    r.removeEventListener("transitionend", a),
                    this.setTransitioning(!1),
                    this.emit("hidden.metisMenu", {
                        hiddenElement: r
                    })
                }
                ;
                r.style.height = `${r.getBoundingClientRect().height}px`,
                r.style.height = `${r.offsetHeight}px`,
                r.classList.add(l),
                r.classList.remove(i),
                r.classList.remove(o),
                this.setTransitioning(!0),
                r.addEventListener("transitionend", a),
                r.style.height = "0px";
                const h = null == c ? void 0 : c.querySelector(this.config.triggerElement);
                null == h || h.setAttribute("aria-expanded", "false"),
                null == h || h.classList.add(n)
            }
            setTransitioning(t) {
                this.isTransitioning = t
            }
            static isElement(t) {
                return Boolean(t.classList)
            }
        }
        return s
    }
    ));
});
