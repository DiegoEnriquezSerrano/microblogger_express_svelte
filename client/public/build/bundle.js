
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function processAjaxData(response, urlPath){
      window.history.pushState({
          "html":response,
          "pageTitle":response.pageTitle
        },
        "",
        urlPath
      );
    }
    async function isAuthenticated() {
      const user = await fetch('http://localhost:4000/authorization');
      return user;
    }

    /* src/components/Section.svelte generated by Svelte v3.24.0 */
    const file = "src/components/Section.svelte";

    function create_fragment(ctx) {
    	let a;
    	let html_tag;
    	let raw_value = /*section*/ ctx[1].icon + "";
    	let t0;
    	let span;
    	let t1_value = /*section*/ ctx[1].name + "";
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			html_tag = new HtmlTag(t0);
    			attr_dev(span, "class", "sectionLinkText");
    			add_location(span, file, 30, 4, 772);
    			attr_dev(a, "class", "sectionLink");
    			attr_dev(a, "href", /*key*/ ctx[0]);
    			add_location(a, file, 28, 2, 664);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			html_tag.m(raw_value, a);
    			append_dev(a, t0);
    			append_dev(a, span);
    			append_dev(span, t1);

    			if (!mounted) {
    				dispose = listen_dev(
    					a,
    					"click",
    					prevent_default(function () {
    						if (is_function(/*sectionClick*/ ctx[2](/*key*/ ctx[0]))) /*sectionClick*/ ctx[2](/*key*/ ctx[0]).apply(this, arguments);
    					}),
    					false,
    					true,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*section*/ 2 && raw_value !== (raw_value = /*section*/ ctx[1].icon + "")) html_tag.p(raw_value);
    			if (dirty & /*section*/ 2 && t1_value !== (t1_value = /*section*/ ctx[1].name + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*key*/ 1) {
    				attr_dev(a, "href", /*key*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { key } = $$props;
    	let { section } = $$props;
    	let { page } = $$props;
    	let dispatch = createEventDispatcher();

    	async function sectionClick(path) {
    		let params = {
    			method: "GET",
    			headers: { "Content-Type": "application/json" }
    		};

    		await fetch(path, params).then(response => {
    			response = { status: response.status, response };
    			return response;
    		}).then(async data => {
    			let res = await data.response.text();

    			if (data.status === 200) {
    				processAjaxData(res, path);
    				dispatch("bubbleUp", path);
    			}

    			
    		});
    	}

    	
    	const writable_props = ["key", "section", "page"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Section> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Section", $$slots, []);

    	$$self.$set = $$props => {
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    		if ("section" in $$props) $$invalidate(1, section = $$props.section);
    		if ("page" in $$props) $$invalidate(3, page = $$props.page);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		processAjaxData,
    		key,
    		section,
    		page,
    		dispatch,
    		sectionClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    		if ("section" in $$props) $$invalidate(1, section = $$props.section);
    		if ("page" in $$props) $$invalidate(3, page = $$props.page);
    		if ("dispatch" in $$props) dispatch = $$props.dispatch;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [key, section, sectionClick, page];
    }

    class Section extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { key: 0, section: 1, page: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Section",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[0] === undefined && !("key" in props)) {
    			console.warn("<Section> was created without expected prop 'key'");
    		}

    		if (/*section*/ ctx[1] === undefined && !("section" in props)) {
    			console.warn("<Section> was created without expected prop 'section'");
    		}

    		if (/*page*/ ctx[3] === undefined && !("page" in props)) {
    			console.warn("<Section> was created without expected prop 'page'");
    		}
    	}

    	get key() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get section() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set section(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get page() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set page(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    let sections = writable({
      "timeline": {
        icon: `
  <svg class="icon" width="21px" height="20px" viewBox="0 0 21 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>home</title>
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g transform="translate(-419.000000, -720.000000)" fill="#59617d">
        <g transform="translate(56.000000, 160.000000)">
          <path d="M379.79996,578 L376.649968,578 L376.649968,574 L370.349983,574 L370.349983,578 L367.19999,578 L367.19999,568.813 L373.489475,562.823 L379.79996,568.832 L379.79996,578 Z M381.899955,568.004 L381.899955,568 L381.899955,568 L373.502075,560 L363,569.992 L364.481546,571.406 L365.099995,570.813 L365.099995,580 L372.449978,580 L372.449978,576 L374.549973,576 L374.549973,580 L381.899955,580 L381.899955,579.997 L381.899955,570.832 L382.514204,571.416 L384.001,570.002 L381.899955,568.004 Z"></path>
        </g>
      </g>
    </g>
  </svg>`,
        name: 'Timeline',
      },
      "directory": {
        icon: `
  <svg class="icon" width="21px" height="20px" viewBox="0 0 21 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>Notifications</title>
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g transform="translate(-299.000000, -280.000000)" fill="#59617d">
        <g transform="translate(56.000000, 160.000000)">
          <path d="M264,138.586 L262.5153,140 L258.06015,135.758 L259.54485,134.343 L264,138.586 Z M251.4,134 C247.9266,134 245.1,131.309 245.1,128 C245.1,124.692 247.9266,122 251.4,122 C254.8734,122 257.7,124.692 257.7,128 C257.7,131.309 254.8734,134 251.4,134 L251.4,134 Z M251.4,120 C246.7611,120 243,123.582 243,128 C243,132.418 246.7611,136 251.4,136 C256.0389,136 259.8,132.418 259.8,128 C259.8,123.582 256.0389,120 251.4,120 L251.4,120 Z"></path>
        </g>
      </g>
    </g>
  </svg>`,
      name: 'Directory'
      },
      "notifications": {
        icon: `
  <svg class="icon" width="17px" height="20px" viewBox="0 0 17 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>Notifications</title>
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g transform="translate(-261.000000, -720.000000)" fill="#59617d">
        <g transform="translate(56.000000, 160.000000)">
          <path d="M217.75,574 L209.25,574 L209.25,568 C209.25,565.334 211.375,564 213.498937,564 L213.501063,564 C215.625,564 217.75,565.334 217.75,568 L217.75,574 Z M214.5625,577 C214.5625,577.552 214.0865,578 213.5,578 C212.9135,578 212.4375,577.552 212.4375,577 L212.4375,576 L214.5625,576 L214.5625,577 Z M219.875,574 L219.875,568 C219.875,564.447 217.359,562.475 214.5625,562.079 L214.5625,560 L212.4375,560 L212.4375,562.079 C209.641,562.475 207.125,564.447 207.125,568 L207.125,574 L205,574 L205,576 L210.3125,576 L210.3125,577 C210.3125,578.657 211.739437,580 213.5,580 C215.260563,580 216.6875,578.657 216.6875,577 L216.6875,576 L222,576 L222,574 L219.875,574 Z"></path>
        </g>
      </g>
    </g>
  </svg>`,
        name: 'Notifications',
      },
      "inbox": {
        icon: `
  <svg class="icon" width="20px" height="15px" viewBox="0 0 20 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>Inbox</title>
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g transform="translate(-340.000000, -922.000000)" fill="#59617d">
        <g transform="translate(56.000000, 160.000000)">
          <path d="M294,774.474 L284,765.649 L284,777 L304,777 L304,765.649 L294,774.474 Z M294.001,771.812 L284,762.981 L284,762 L304,762 L304,762.981 L294.001,771.812 Z"></path>
        </g>
      </g>
    </g>
  </svg>`,
        name: 'Messages'
      },
      "settings": {
        icon: `
  <svg class="icon" width="21px" height="20px" viewBox="0 0 21 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>settings</title>
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g transform="translate(-419.000000, -320.000000)" fill="#59617d">
        <g transform="translate(56.000000, 160.000000)">
          <path d="M374.55,170 C374.55,170.552 374.0796,171 373.5,171 C372.9204,171 372.45,170.552 372.45,170 C372.45,169.448 372.9204,169 373.5,169 C374.0796,169 374.55,169.448 374.55,170 M378.561,171.358 C378.09585,173.027 376.67835,174.377 374.9259,174.82 C370.9359,175.828 367.3806,172.442 368.439,168.642 C368.90415,166.973 370.32165,165.623 372.0741,165.18 C376.0641,164.172 379.6194,167.558 378.561,171.358 M382.95,169 L381.2112,169 C380.95815,169 380.6106,168.984 380.6127,168.743 C380.61795,167.854 380.3124,166.59 379.6383,165.898 C379.4661,165.721 379.5165,165.559 379.695,165.389 L380.92455,164.281 C381.3351,163.89 381.3351,163.288 380.92455,162.898 C380.51505,162.507 379.84935,162.523 379.43985,162.913 L378.2103,164.092 C378.0318,164.262 377.75565,164.283 377.5446,164.151 C376.7781,163.669 375.91185,163.322 374.9805,163.141 C374.7327,163.092 374.55,162.897 374.55,162.656 L374.55,161 C374.55,160.448 374.0796,160 373.5,160 C372.9204,160 372.45,160.448 372.45,161 L372.45,162.656 C372.45,162.897 372.2673,163.094 372.0195,163.143 C371.08815,163.324 370.2219,163.672 369.4554,164.154 C369.24435,164.287 368.9682,164.27 368.7897,164.1 L367.56015,162.929 C367.15065,162.538 366.48495,162.538 366.07545,162.929 C365.6649,163.319 365.6649,163.953 366.07545,164.343 L367.305,165.514 C367.4835,165.684 367.5108,165.953 367.3617,166.148 C366.843,166.831 366.5112,167.562 366.3621,168.84 C366.33375,169.079 366.04185,169 365.7888,169 L364.05,169 C363.4704,169 363,169.448 363,170 C363,170.552 363.4704,171 364.05,171 L365.7888,171 C366.04185,171 366.34845,171.088 366.39885,171.323 C366.5889,172.21 366.85665,172.872 367.3617,173.602 C367.50135,173.803 367.4835,174.191 367.305,174.361 L366.07545,175.594 C365.6649,175.985 365.6649,176.649 366.07545,177.04 C366.48495,177.43 367.15065,177.446 367.56015,177.055 L368.7897,175.892 C368.9682,175.722 369.24435,175.709 369.4554,175.842 C370.2219,176.323 371.08815,176.674 372.0195,176.855 C372.2673,176.904 372.45,177.103 372.45,177.344 L372.45,179 C372.45,179.552 372.9204,180 373.5,180 C374.0796,180 374.55,179.552 374.55,179 L374.55,177.344 C374.55,177.103 374.7327,176.906 374.9805,176.857 C375.91185,176.676 376.7781,176.327 377.5446,175.846 C377.75565,175.713 378.0318,175.73 378.2103,175.9 L379.43985,177.071 C379.84935,177.462 380.51505,177.462 380.92455,177.071 C381.3351,176.681 381.3351,176.047 380.92455,175.657 L379.695,174.486 C379.5165,174.316 379.49865,174.053 379.6383,173.852 C380.14335,173.122 380.4174,172.714 380.69985,171.91 C380.7807,171.682 380.95815,171 381.2112,171 L382.95,171 C383.5296,171 384,170.552 384,170 C384,169.448 383.5296,169 382.95,169"></path>
        </g>
      </g>
    </g>
  </svg>`,
        name: 'Settings'
      },

    });

    /* src/components/Sections.svelte generated by Svelte v3.24.0 */

    const { Object: Object_1 } = globals;
    const file$1 = "src/components/Sections.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (39:4) {#each Object.keys($sections) as key}
    function create_each_block(ctx) {
    	let section;
    	let current;

    	section = new Section({
    			props: {
    				page: /*page*/ ctx[0],
    				key: /*key*/ ctx[5],
    				section: /*$sections*/ ctx[1][/*key*/ ctx[5]]
    			},
    			$$inline: true
    		});

    	section.$on("bubbleUp", /*bubbleUp*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(section.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(section, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const section_changes = {};
    			if (dirty & /*page*/ 1) section_changes.page = /*page*/ ctx[0];
    			if (dirty & /*$sections*/ 2) section_changes.key = /*key*/ ctx[5];
    			if (dirty & /*$sections*/ 2) section_changes.section = /*$sections*/ ctx[1][/*key*/ ctx[5]];
    			section.$set(section_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(section.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(section.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(section, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(39:4) {#each Object.keys($sections) as key}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let nav;
    	let div;
    	let button;
    	let svg0;
    	let title0;
    	let t0;
    	let g2;
    	let g1;
    	let g0;
    	let path0;
    	let t1;
    	let span0;
    	let t2;
    	let t3;
    	let a;
    	let svg1;
    	let title1;
    	let t4;
    	let g5;
    	let g4;
    	let g3;
    	let path1;
    	let t5;
    	let span1;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = Object.keys(/*$sections*/ ctx[1]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div = element("div");
    			button = element("button");
    			svg0 = svg_element("svg");
    			title0 = svg_element("title");
    			t0 = text("Menu");
    			g2 = svg_element("g");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			t1 = space();
    			span0 = element("span");
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			a = element("a");
    			svg1 = svg_element("svg");
    			title1 = svg_element("title");
    			t4 = text("logout");
    			g5 = svg_element("g");
    			g4 = svg_element("g");
    			g3 = svg_element("g");
    			path1 = svg_element("path");
    			t5 = space();
    			span1 = element("span");
    			span1.textContent = "Logout";
    			add_location(title0, file$1, 26, 8, 703);
    			attr_dev(path0, "d", "M124.575,174 C123.7056,174 123,174.672 123,175.5 C123,176.328 123.7056,177 124.575,177 C125.4444,177 126.15,176.328 126.15,175.5 C126.15,174.672 125.4444,174 124.575,174 L124.575,174 Z M128.25,177 L144,177 L144,175 L128.25,175 L128.25,177 Z M124.575,168 C123.7056,168 123,168.672 123,169.5 C123,170.328 123.7056,171 124.575,171 C125.4444,171 126.15,170.328 126.15,169.5 C126.15,168.672 125.4444,168 124.575,168 L124.575,168 Z M128.25,171 L144,171 L144,169 L128.25,169 L128.25,171 Z M124.575,162 C123.7056,162 123,162.672 123,163.5 C123,164.328 123.7056,165 124.575,165 C125.4444,165 126.15,164.328 126.15,163.5 C126.15,162.672 125.4444,162 124.575,162 L124.575,162 Z M128.25,165 L144,165 L144,163 L128.25,163 L128.25,165 Z");
    			add_location(path0, file$1, 30, 14, 950);
    			attr_dev(g0, "transform", "translate(56.000000, 160.000000)");
    			add_location(g0, file$1, 29, 12, 887);
    			attr_dev(g1, "transform", "translate(-179.000000, -322.000000)");
    			attr_dev(g1, "fill", "#59617d");
    			add_location(g1, file$1, 28, 10, 808);
    			attr_dev(g2, "stroke", "none");
    			attr_dev(g2, "stroke-width", "1");
    			attr_dev(g2, "fill", "none");
    			attr_dev(g2, "fill-rule", "evenodd");
    			add_location(g2, file$1, 27, 8, 731);
    			attr_dev(svg0, "class", "icon");
    			attr_dev(svg0, "width", "21px");
    			attr_dev(svg0, "height", "15px");
    			attr_dev(svg0, "viewBox", "0 0 21 15");
    			attr_dev(svg0, "version", "1.1");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			add_location(svg0, file$1, 25, 6, 537);
    			attr_dev(span0, "class", "filler");
    			add_location(span0, file$1, 35, 6, 1755);
    			attr_dev(button, "class", "sectionLink");
    			attr_dev(button, "id", "sections_expander");
    			add_location(button, file$1, 24, 4, 453);
    			add_location(title1, file$1, 44, 8, 2151);
    			attr_dev(path1, "d", "M378.381271,401.145 C377.596921,400.752 376.64982,401.278 376.64982,402.123 C376.64982,402.552 376.91862,402.925 377.316571,403.126 C380.236622,404.602 382.110873,407.716 381.575372,411.174 C381.046172,414.602 378.050521,417.343 374.434319,417.728 C369.515067,418.251 365.333966,414.581 365.333966,410 C365.333966,407.004 367.121066,404.4 369.733467,403.101 C370.102018,402.918 370.349818,402.572 370.349818,402.176 L370.349818,402.084 C370.349818,401.256 369.423717,400.745 368.651967,401.129 C364.951765,402.966 362.545164,406.841 363.072265,411.191 C363.624565,415.742 367.515866,419.43 372.296519,419.936 C378.634321,420.607 383.999823,415.9 383.999823,410 C383.999823,406.155 381.722372,402.818 378.381271,401.145 M372.449819,409 L372.449819,401 C372.449819,400.447 372.920219,400 373.499819,400 C374.080469,400 374.549819,400.447 374.549819,401 L374.549819,409 C374.549819,409.552 374.080469,410 373.499819,410 C372.920219,410 372.449819,409.552 372.449819,409");
    			add_location(path1, file$1, 48, 14, 2400);
    			attr_dev(g3, "transform", "translate(56.000000, 160.000000)");
    			add_location(g3, file$1, 47, 12, 2337);
    			attr_dev(g4, "transform", "translate(-419.000000, -560.000000)");
    			attr_dev(g4, "fill", "#59617d");
    			add_location(g4, file$1, 46, 10, 2258);
    			attr_dev(g5, "stroke", "none");
    			attr_dev(g5, "stroke-width", "1");
    			attr_dev(g5, "fill", "none");
    			attr_dev(g5, "fill-rule", "evenodd");
    			add_location(g5, file$1, 45, 8, 2181);
    			attr_dev(svg1, "class", "icon");
    			attr_dev(svg1, "width", "21px");
    			attr_dev(svg1, "height", "20px");
    			attr_dev(svg1, "viewBox", "0 0 21 20");
    			attr_dev(svg1, "version", "1.1");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			add_location(svg1, file$1, 43, 6, 1985);
    			attr_dev(span1, "class", "sectionLinkText");
    			add_location(span1, file$1, 53, 6, 3449);
    			attr_dev(a, "class", "sectionLink");
    			attr_dev(a, "href", "logout");
    			add_location(a, file$1, 42, 4, 1941);
    			attr_dev(div, "id", "sectionsContainer");
    			add_location(div, file$1, 22, 2, 419);
    			attr_dev(nav, "id", "sectionsModule");
    			add_location(nav, file$1, 21, 0, 391);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div);
    			append_dev(div, button);
    			append_dev(button, svg0);
    			append_dev(svg0, title0);
    			append_dev(title0, t0);
    			append_dev(svg0, g2);
    			append_dev(g2, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path0);
    			append_dev(button, t1);
    			append_dev(button, span0);
    			append_dev(div, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t3);
    			append_dev(div, a);
    			append_dev(a, svg1);
    			append_dev(svg1, title1);
    			append_dev(title1, t4);
    			append_dev(svg1, g5);
    			append_dev(g5, g4);
    			append_dev(g4, g3);
    			append_dev(g3, path1);
    			append_dev(a, t5);
    			append_dev(a, span1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "focus", /*expandSections*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*page, Object, $sections, bubbleUp*/ 11) {
    				each_value = Object.keys(/*$sections*/ ctx[1]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, t3);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $sections;
    	validate_store(sections, "sections");
    	component_subscribe($$self, sections, $$value => $$invalidate(1, $sections = $$value));
    	let { page } = $$props;
    	let dispatch = createEventDispatcher();

    	let expandSections = e => {
    		e.target.parentElement.classList.toggle("expanded");
    		e.target.blur();
    	};

    	let bubbleUp = e => {
    		dispatch("loadPage", e.detail);
    	};

    	const writable_props = ["page"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Sections> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Sections", $$slots, []);

    	$$self.$set = $$props => {
    		if ("page" in $$props) $$invalidate(0, page = $$props.page);
    	};

    	$$self.$capture_state = () => ({
    		Section,
    		sections,
    		createEventDispatcher,
    		page,
    		dispatch,
    		expandSections,
    		bubbleUp,
    		$sections
    	});

    	$$self.$inject_state = $$props => {
    		if ("page" in $$props) $$invalidate(0, page = $$props.page);
    		if ("dispatch" in $$props) dispatch = $$props.dispatch;
    		if ("expandSections" in $$props) $$invalidate(2, expandSections = $$props.expandSections);
    		if ("bubbleUp" in $$props) $$invalidate(3, bubbleUp = $$props.bubbleUp);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [page, $sections, expandSections, bubbleUp];
    }

    class Sections extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { page: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sections",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*page*/ ctx[0] === undefined && !("page" in props)) {
    			console.warn("<Sections> was created without expected prop 'page'");
    		}
    	}

    	get page() {
    		throw new Error("<Sections>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set page(value) {
    		throw new Error("<Sections>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/timeline/Timeline.svelte generated by Svelte v3.24.0 */

    const { console: console_1 } = globals;
    const file$2 = "src/components/timeline/Timeline.svelte";

    function create_fragment$2(ctx) {
    	let div4;
    	let div3;
    	let h3;
    	let t1;
    	let div0;
    	let span0;
    	let t3;
    	let label;
    	let input;
    	let t4;
    	let span1;
    	let t5;
    	let div1;
    	let span2;
    	let t7;
    	let span3;
    	let t9;
    	let textarea;
    	let t10;
    	let div2;
    	let button0;
    	let t12;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			h3 = element("h3");
    			h3.textContent = "New Post";
    			t1 = space();
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "Draft?";
    			t3 = space();
    			label = element("label");
    			input = element("input");
    			t4 = space();
    			span1 = element("span");
    			t5 = space();
    			div1 = element("div");
    			span2 = element("span");
    			span2.textContent = "Great success.";
    			t7 = space();
    			span3 = element("span");
    			span3.textContent = "Couldn't publish. Try again.";
    			t9 = space();
    			textarea = element("textarea");
    			t10 = space();
    			div2 = element("div");
    			button0 = element("button");
    			button0.textContent = "Post";
    			t12 = space();
    			button1 = element("button");
    			button1.textContent = "Preview";
    			attr_dev(h3, "class", "svelte-ttua8v");
    			add_location(h3, file$2, 12, 4, 139);
    			attr_dev(span0, "id", "");
    			add_location(span0, file$2, 14, 6, 193);
    			attr_dev(input, "class", "draftActive svelte-ttua8v");
    			input.value = "1";
    			attr_dev(input, "type", "checkbox");
    			add_location(input, file$2, 16, 8, 256);
    			attr_dev(span1, "class", "slider round svelte-ttua8v");
    			add_location(span1, file$2, 17, 8, 318);
    			attr_dev(label, "class", "switch svelte-ttua8v");
    			add_location(label, file$2, 15, 6, 225);
    			attr_dev(div0, "class", "draftSlider svelte-ttua8v");
    			add_location(div0, file$2, 13, 4, 161);
    			attr_dev(span2, "class", "success");
    			attr_dev(span2, "id", "postSuccess");
    			add_location(span2, file$2, 21, 6, 431);
    			attr_dev(span3, "class", "danger");
    			attr_dev(span3, "id", "postFail");
    			add_location(span3, file$2, 22, 6, 498);
    			attr_dev(div1, "id", "postFeedback");
    			attr_dev(div1, "class", "svelte-ttua8v");
    			add_location(div1, file$2, 20, 4, 401);
    			attr_dev(textarea, "id", "postBody");
    			attr_dev(textarea, "placeholder", "Tell the world how you feel!");
    			attr_dev(textarea, "class", "svelte-ttua8v");
    			add_location(textarea, file$2, 24, 4, 603);
    			attr_dev(button0, "id", "postSubmit");
    			attr_dev(button0, "class", "svelte-ttua8v");
    			add_location(button0, file$2, 26, 6, 732);
    			attr_dev(button1, "id", "postPreview");
    			attr_dev(button1, "class", "svelte-ttua8v");
    			add_location(button1, file$2, 27, 6, 796);
    			attr_dev(div2, "id", "postActions");
    			attr_dev(div2, "class", "svelte-ttua8v");
    			add_location(div2, file$2, 25, 4, 703);
    			attr_dev(div3, "class", "postForm svelte-ttua8v");
    			add_location(div3, file$2, 11, 2, 112);
    			attr_dev(div4, "id", "postContainer");
    			attr_dev(div4, "class", "svelte-ttua8v");
    			add_location(div4, file$2, 10, 0, 85);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, h3);
    			append_dev(div3, t1);
    			append_dev(div3, div0);
    			append_dev(div0, span0);
    			append_dev(div0, t3);
    			append_dev(div0, label);
    			append_dev(label, input);
    			append_dev(label, t4);
    			append_dev(label, span1);
    			append_dev(div3, t5);
    			append_dev(div3, div1);
    			append_dev(div1, span2);
    			append_dev(div1, t7);
    			append_dev(div1, span3);
    			append_dev(div3, t9);
    			append_dev(div3, textarea);
    			/*textarea_binding*/ ctx[2](textarea);
    			append_dev(div3, t10);
    			append_dev(div3, div2);
    			append_dev(div2, button0);
    			append_dev(div2, t12);
    			append_dev(div2, button1);

    			if (!mounted) {
    				dispose = listen_dev(button0, "click", /*sendPost*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			/*textarea_binding*/ ctx[2](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let post;

    	let sendPost = () => {
    		console.log(post.value);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Timeline> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Timeline", $$slots, []);

    	function textarea_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			post = $$value;
    			$$invalidate(0, post);
    		});
    	}

    	$$self.$capture_state = () => ({ post, sendPost });

    	$$self.$inject_state = $$props => {
    		if ("post" in $$props) $$invalidate(0, post = $$props.post);
    		if ("sendPost" in $$props) $$invalidate(1, sendPost = $$props.sendPost);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [post, sendPost, textarea_binding];
    }

    class Timeline extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Timeline",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/timeline/Drafts.svelte generated by Svelte v3.24.0 */

    const file$3 = "src/components/timeline/Drafts.svelte";

    function create_fragment$3(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Drafts";
    			add_location(h1, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Drafts> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Drafts", $$slots, []);
    	return [];
    }

    class Drafts extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Drafts",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/timeline/Published.svelte generated by Svelte v3.24.0 */

    const file$4 = "src/components/timeline/Published.svelte";

    function create_fragment$4(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Published";
    			add_location(h1, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Published> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Published", $$slots, []);
    	return [];
    }

    class Published extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Published",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/timeline/Liked.svelte generated by Svelte v3.24.0 */

    const file$5 = "src/components/timeline/Liked.svelte";

    function create_fragment$5(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Liked";
    			add_location(h1, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Liked> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Liked", $$slots, []);
    	return [];
    }

    class Liked extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Liked",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/Index.svelte generated by Svelte v3.24.0 */
    const file$6 = "src/components/Index.svelte";

    // (26:32) 
    function create_if_block_3(ctx) {
    	let liked;
    	let current;
    	liked = new Liked({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(liked.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(liked, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(liked.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(liked.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(liked, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(26:32) ",
    		ctx
    	});

    	return block;
    }

    // (24:36) 
    function create_if_block_2(ctx) {
    	let published;
    	let current;
    	published = new Published({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(published.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(published, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(published.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(published.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(published, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(24:36) ",
    		ctx
    	});

    	return block;
    }

    // (22:33) 
    function create_if_block_1(ctx) {
    	let drafts;
    	let current;
    	drafts = new Drafts({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(drafts.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(drafts, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(drafts.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(drafts.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(drafts, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(22:33) ",
    		ctx
    	});

    	return block;
    }

    // (20:2) {#if pageName == 'timeline'}
    function create_if_block(ctx) {
    	let timeline;
    	let current;
    	timeline = new Timeline({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(timeline.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(timeline, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(timeline.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(timeline.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(timeline, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(20:2) {#if pageName == 'timeline'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let title_value;
    	let t;
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	document.title = title_value = "Microblogger | " + /*pageNameCapitalized*/ ctx[1];
    	const if_block_creators = [create_if_block, create_if_block_1, create_if_block_2, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*pageName*/ ctx[0] == "timeline") return 0;
    		if (/*pageName*/ ctx[0] == "drafts") return 1;
    		if (/*pageName*/ ctx[0] == "published") return 2;
    		if (/*pageName*/ ctx[0] == "liked") return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			t = space();
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "id", "homeModule");
    			attr_dev(div, "class", "svelte-h60ruw");
    			add_location(div, file$6, 18, 2, 470);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*pageNameCapitalized*/ 2) && title_value !== (title_value = "Microblogger | " + /*pageNameCapitalized*/ ctx[1])) {
    				document.title = title_value;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { page } = $$props;
    	const writable_props = ["page"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Index> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Index", $$slots, []);

    	$$self.$set = $$props => {
    		if ("page" in $$props) $$invalidate(2, page = $$props.page);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Timeline,
    		Drafts,
    		Published,
    		Liked,
    		page,
    		pageName,
    		pageNameCapitalized
    	});

    	$$self.$inject_state = $$props => {
    		if ("page" in $$props) $$invalidate(2, page = $$props.page);
    		if ("pageName" in $$props) $$invalidate(0, pageName = $$props.pageName);
    		if ("pageNameCapitalized" in $$props) $$invalidate(1, pageNameCapitalized = $$props.pageNameCapitalized);
    	};

    	let pageName;
    	let pageNameCapitalized;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*page*/ 4) {
    			 $$invalidate(0, pageName = page);
    		}

    		if ($$self.$$.dirty & /*page*/ 4) {
    			 $$invalidate(1, pageNameCapitalized = page[0].toUpperCase() + page.slice(1));
    		}
    	};

    	return [pageName, pageNameCapitalized, page];
    }

    class Index extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { page: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Index",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*page*/ ctx[2] === undefined && !("page" in props)) {
    			console.warn("<Index> was created without expected prop 'page'");
    		}
    	}

    	get page() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set page(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Directory.svelte generated by Svelte v3.24.0 */
    const file$7 = "src/components/Directory.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (34:4) {#each users as user}
    function create_each_block$1(ctx) {
    	let div3;
    	let div1;
    	let a0;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let br0;
    	let t1;
    	let a1;
    	let t2_value = (/*user*/ ctx[5].displayname || /*user*/ ctx[5].username) + "";
    	let t2;
    	let br1;
    	let t3;
    	let span;
    	let t4;
    	let t5_value = /*user*/ ctx[5].username + "";
    	let t5;
    	let br2;
    	let t6;
    	let p;
    	let t7_value = (/*user*/ ctx[5].bio || "") + "";
    	let t7;
    	let t8;
    	let div2;
    	let a2;
    	let svg0;
    	let title0;
    	let t9;
    	let g2;
    	let g1;
    	let g0;
    	let path0;
    	let t10;
    	let a3;
    	let svg1;
    	let title1;
    	let t11;
    	let g5;
    	let g4;
    	let g3;
    	let path1;
    	let t12;
    	let a4;
    	let svg2;
    	let title2;
    	let t13;
    	let g8;
    	let g7;
    	let g6;
    	let path2;
    	let t14;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div1 = element("div");
    			a0 = element("a");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			a1 = element("a");
    			t2 = text(t2_value);
    			br1 = element("br");
    			t3 = space();
    			span = element("span");
    			t4 = text("@");
    			t5 = text(t5_value);
    			br2 = element("br");
    			t6 = space();
    			p = element("p");
    			t7 = text(t7_value);
    			t8 = space();
    			div2 = element("div");
    			a2 = element("a");
    			svg0 = svg_element("svg");
    			title0 = svg_element("title");
    			t9 = text("follow");
    			g2 = svg_element("g");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			t10 = space();
    			a3 = element("a");
    			svg1 = svg_element("svg");
    			title1 = svg_element("title");
    			t11 = text("Message");
    			g5 = svg_element("g");
    			g4 = svg_element("g");
    			g3 = svg_element("g");
    			path1 = svg_element("path");
    			t12 = space();
    			a4 = element("a");
    			svg2 = svg_element("svg");
    			title2 = svg_element("title");
    			t13 = text("Block");
    			g8 = svg_element("g");
    			g7 = svg_element("g");
    			g6 = svg_element("g");
    			path2 = svg_element("path");
    			t14 = space();

    			if (img.src !== (img_src_value = "http://localhost:5000/assets/" + (/*user*/ ctx[5].photo
    			? `uploads/${/*user*/ ctx[5].photo}`
    			: "images/profiledefault.jpg"))) attr_dev(img, "src", img_src_value);

    			attr_dev(img, "alt", "avatar");
    			attr_dev(img, "class", "svelte-qiiz4x");
    			add_location(img, file$7, 38, 14, 868);
    			attr_dev(div0, "class", "user_img svelte-qiiz4x");
    			add_location(div0, file$7, 37, 12, 831);
    			attr_dev(a0, "class", "user_avatar");
    			attr_dev(a0, "href", "/");
    			add_location(a0, file$7, 36, 10, 786);
    			add_location(br0, file$7, 41, 10, 1038);
    			attr_dev(a1, "class", "userName svelte-qiiz4x");
    			attr_dev(a1, "href", "/");
    			add_location(a1, file$7, 42, 10, 1053);
    			add_location(br1, file$7, 42, 78, 1121);
    			add_location(span, file$7, 43, 10, 1136);
    			add_location(br2, file$7, 43, 39, 1165);
    			attr_dev(p, "class", "userNodeBio svelte-qiiz4x");
    			add_location(p, file$7, 44, 10, 1180);
    			attr_dev(div1, "class", "userNodeInfo svelte-qiiz4x");
    			add_location(div1, file$7, 35, 8, 749);
    			add_location(title0, file$7, 49, 14, 1524);
    			attr_dev(path0, "d", "M58.0831232,2004.99998 C58.0831232,2002.79398 56.2518424,2000.99998 54,2000.99998 C51.7481576,2000.99998 49.9168768,2002.79398 49.9168768,2004.99998 C49.9168768,2007.20598 51.7481576,2008.99998 54,2008.99998 C56.2518424,2008.99998 58.0831232,2007.20598 58.0831232,2004.99998 M61.9457577,2018.99998 L60.1246847,2018.99998 C59.5612137,2018.99998 59.1039039,2018.55198 59.1039039,2017.99998 C59.1039039,2017.44798 59.5612137,2016.99998 60.1246847,2016.99998 L60.5625997,2016.99998 C61.26898,2016.99998 61.790599,2016.30298 61.5231544,2015.66198 C60.2869889,2012.69798 57.3838883,2010.99998 54,2010.99998 C50.6161117,2010.99998 47.7130111,2012.69798 46.4768456,2015.66198 C46.209401,2016.30298 46.73102,2016.99998 47.4374003,2016.99998 L47.8753153,2016.99998 C48.4387863,2016.99998 48.8960961,2017.44798 48.8960961,2017.99998 C48.8960961,2018.55198 48.4387863,2018.99998 47.8753153,2018.99998 L46.0542423,2018.99998 C44.7782664,2018.99998 43.7738181,2017.85698 44.044325,2016.63598 C44.7874534,2013.27698 47.1076881,2010.79798 50.1639058,2009.67298 C48.7695192,2008.57398 47.8753153,2006.88998 47.8753153,2004.99998 C47.8753153,2001.44898 51.0234032,1998.61898 54.7339414,1999.04198 C57.422678,1999.34798 59.6500217,2001.44698 60.0532301,2004.06998 C60.4002955,2006.33098 59.4560733,2008.39598 57.8360942,2009.67298 C60.8923119,2010.79798 63.2125466,2013.27698 63.955675,2016.63598 C64.2261819,2017.85698 63.2217336,2018.99998 61.9457577,2018.99998 M57.0623424,2017.99998 C57.0623424,2018.55198 56.6050326,2018.99998 56.0415616,2018.99998 L55.2290201,2018.99998 C55.2290201,2019.99998 55.3351813,2020.99998 54.2082393,2020.99998 C53.6437475,2020.99998 53.1874585,2020.55198 53.1874585,2019.99998 L53.1874585,2018.99998 L51.9584384,2018.99998 C51.3949674,2018.99998 50.9376576,2018.55198 50.9376576,2017.99998 C50.9376576,2017.44798 51.3949674,2016.99998 51.9584384,2016.99998 L53.1874585,2016.99998 L53.1874585,2015.99998 C53.1874585,2015.44798 53.6437475,2014.99998 54.2082393,2014.99998 C54.7717103,2014.99998 55.2290201,2015.44798 55.2290201,2015.99998 L55.2290201,2016.99998 L56.0415616,2016.99998 C56.6050326,2016.99998 57.0623424,2017.44798 57.0623424,2017.99998");
    			add_location(path0, file$7, 53, 20, 1798);
    			attr_dev(g0, "transform", "translate(56.000000, 160.000000)");
    			attr_dev(g0, "class", "svelte-qiiz4x");
    			add_location(g0, file$7, 52, 18, 1729);
    			attr_dev(g1, "transform", "translate(-100.000000, -2159.000000)");
    			attr_dev(g1, "fill", "#59617d");
    			attr_dev(g1, "class", "svelte-qiiz4x");
    			add_location(g1, file$7, 51, 16, 1643);
    			attr_dev(g2, "stroke", "none");
    			attr_dev(g2, "stroke-width", "1");
    			attr_dev(g2, "fill", "none");
    			attr_dev(g2, "fill-rule", "evenodd");
    			attr_dev(g2, "class", "svelte-qiiz4x");
    			add_location(g2, file$7, 50, 14, 1560);
    			attr_dev(svg0, "class", "icon svelte-qiiz4x");
    			attr_dev(svg0, "width", "20px");
    			attr_dev(svg0, "height", "22px");
    			attr_dev(svg0, "viewBox", "0 0 20 22");
    			attr_dev(svg0, "version", "1.1");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			add_location(svg0, file$7, 48, 12, 1352);
    			attr_dev(a2, "class", "toggleFollow");
    			attr_dev(a2, "href", "/");
    			add_location(a2, file$7, 47, 10, 1306);
    			add_location(title1, file$7, 61, 14, 4285);
    			attr_dev(path1, "d", "M262,764.291 L254,771.318 L246,764.281 L246,764 L262,764 L262,764.291 Z M246,775 L246,766.945 L254,773.98 L262,766.953 L262,775 L246,775 Z M244,777 L264,777 L264,762 L244,762 L244,777 Z");
    			add_location(path1, file$7, 65, 20, 4559);
    			attr_dev(g3, "transform", "translate(56.000000, 160.000000)");
    			attr_dev(g3, "class", "svelte-qiiz4x");
    			add_location(g3, file$7, 64, 18, 4490);
    			attr_dev(g4, "transform", "translate(-300.000000, -922.000000)");
    			attr_dev(g4, "fill", "#59617d");
    			attr_dev(g4, "class", "svelte-qiiz4x");
    			add_location(g4, file$7, 63, 16, 4405);
    			attr_dev(g5, "stroke", "none");
    			attr_dev(g5, "stroke-width", "1");
    			attr_dev(g5, "fill", "none");
    			attr_dev(g5, "fill-rule", "evenodd");
    			attr_dev(g5, "class", "svelte-qiiz4x");
    			add_location(g5, file$7, 62, 14, 4322);
    			attr_dev(svg1, "class", "icon svelte-qiiz4x");
    			attr_dev(svg1, "width", "30px");
    			attr_dev(svg1, "height", "30px");
    			attr_dev(svg1, "viewBox", "0 0 20 15");
    			attr_dev(svg1, "version", "1.1");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			add_location(svg1, file$7, 60, 12, 4113);
    			attr_dev(a3, "href", "/");
    			add_location(a3, file$7, 59, 10, 4088);
    			add_location(title2, file$7, 73, 14, 5067);
    			attr_dev(path2, "d", "M177.7,450 C177.7,450.552 177.2296,451 176.65,451 L170.35,451 C169.7704,451 169.3,450.552 169.3,450 C169.3,449.448 169.7704,449 170.35,449 L176.65,449 C177.2296,449 177.7,449.448 177.7,450 M173.5,458 C168.86845,458 165.1,454.411 165.1,450 C165.1,445.589 168.86845,442 173.5,442 C178.13155,442 181.9,445.589 181.9,450 C181.9,454.411 178.13155,458 173.5,458 M173.5,440 C167.70085,440 163,444.477 163,450 C163,455.523 167.70085,460 173.5,460 C179.29915,460 184,455.523 184,450 C184,444.477 179.29915,440 173.5,440");
    			add_location(path2, file$7, 77, 20, 5339);
    			attr_dev(g6, "transform", "translate(56.000000, 160.000000)");
    			attr_dev(g6, "class", "svelte-qiiz4x");
    			add_location(g6, file$7, 76, 18, 5270);
    			attr_dev(g7, "transform", "translate(-219.000000, -600.000000)");
    			attr_dev(g7, "fill", "#59617d");
    			attr_dev(g7, "class", "svelte-qiiz4x");
    			add_location(g7, file$7, 75, 16, 5185);
    			attr_dev(g8, "stroke", "none");
    			attr_dev(g8, "stroke-width", "1");
    			attr_dev(g8, "fill", "none");
    			attr_dev(g8, "fill-rule", "evenodd");
    			attr_dev(g8, "class", "svelte-qiiz4x");
    			add_location(g8, file$7, 74, 14, 5102);
    			attr_dev(svg2, "class", "icon svelte-qiiz4x");
    			attr_dev(svg2, "width", "30px");
    			attr_dev(svg2, "height", "30px");
    			attr_dev(svg2, "viewBox", "0 0 21 20");
    			attr_dev(svg2, "version", "1.1");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			add_location(svg2, file$7, 72, 12, 4895);
    			attr_dev(a4, "href", "/");
    			add_location(a4, file$7, 71, 10, 4870);
    			attr_dev(div2, "class", "userNodeActions svelte-qiiz4x");
    			add_location(div2, file$7, 46, 8, 1266);
    			attr_dev(div3, "class", "userNode svelte-qiiz4x");
    			add_location(div3, file$7, 34, 6, 718);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, a0);
    			append_dev(a0, div0);
    			append_dev(div0, img);
    			append_dev(div1, t0);
    			append_dev(div1, br0);
    			append_dev(div1, t1);
    			append_dev(div1, a1);
    			append_dev(a1, t2);
    			append_dev(div1, br1);
    			append_dev(div1, t3);
    			append_dev(div1, span);
    			append_dev(span, t4);
    			append_dev(span, t5);
    			append_dev(div1, br2);
    			append_dev(div1, t6);
    			append_dev(div1, p);
    			append_dev(p, t7);
    			append_dev(div3, t8);
    			append_dev(div3, div2);
    			append_dev(div2, a2);
    			append_dev(a2, svg0);
    			append_dev(svg0, title0);
    			append_dev(title0, t9);
    			append_dev(svg0, g2);
    			append_dev(g2, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path0);
    			append_dev(div2, t10);
    			append_dev(div2, a3);
    			append_dev(a3, svg1);
    			append_dev(svg1, title1);
    			append_dev(title1, t11);
    			append_dev(svg1, g5);
    			append_dev(g5, g4);
    			append_dev(g4, g3);
    			append_dev(g3, path1);
    			append_dev(div2, t12);
    			append_dev(div2, a4);
    			append_dev(a4, svg2);
    			append_dev(svg2, title2);
    			append_dev(title2, t13);
    			append_dev(svg2, g8);
    			append_dev(g8, g7);
    			append_dev(g7, g6);
    			append_dev(g6, path2);
    			append_dev(div3, t14);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*users*/ 1 && img.src !== (img_src_value = "http://localhost:5000/assets/" + (/*user*/ ctx[5].photo
    			? `uploads/${/*user*/ ctx[5].photo}`
    			: "images/profiledefault.jpg"))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*users*/ 1 && t2_value !== (t2_value = (/*user*/ ctx[5].displayname || /*user*/ ctx[5].username) + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*users*/ 1 && t5_value !== (t5_value = /*user*/ ctx[5].username + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*users*/ 1 && t7_value !== (t7_value = (/*user*/ ctx[5].bio || "") + "")) set_data_dev(t7, t7_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(34:4) {#each users as user}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let title_value;
    	let t;
    	let div1;
    	let div0;
    	document.title = title_value = "Microblogger | " + /*pageNameCapitalized*/ ctx[1];
    	let each_value = /*users*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			t = space();
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "id", "usersContainer");
    			attr_dev(div0, "class", "svelte-qiiz4x");
    			add_location(div0, file$7, 32, 2, 660);
    			attr_dev(div1, "id", "usersModule");
    			attr_dev(div1, "class", "svelte-qiiz4x");
    			add_location(div1, file$7, 31, 0, 635);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*pageNameCapitalized*/ 2 && title_value !== (title_value = "Microblogger | " + /*pageNameCapitalized*/ ctx[1])) {
    				document.title = title_value;
    			}

    			if (dirty & /*users*/ 1) {
    				each_value = /*users*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { page } = $$props;

    	async function showUsers() {
    		let path = "http://localhost:4000/getUsers";

    		let params = {
    			method: "GET",
    			headers: { "Content-Type": "application/json" }
    		};

    		fetch(path, params).then(async response => {
    			$$invalidate(0, users = await response.text());
    			$$invalidate(0, users = JSON.parse(users));
    		});
    	}

    	

    	onMount(() => {
    		showUsers();
    	});

    	const writable_props = ["page"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Directory> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Directory", $$slots, []);

    	$$self.$set = $$props => {
    		if ("page" in $$props) $$invalidate(2, page = $$props.page);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onMount,
    		page,
    		showUsers,
    		users,
    		pageName,
    		pageNameCapitalized
    	});

    	$$self.$inject_state = $$props => {
    		if ("page" in $$props) $$invalidate(2, page = $$props.page);
    		if ("users" in $$props) $$invalidate(0, users = $$props.users);
    		if ("pageName" in $$props) pageName = $$props.pageName;
    		if ("pageNameCapitalized" in $$props) $$invalidate(1, pageNameCapitalized = $$props.pageNameCapitalized);
    	};

    	let users;
    	let pageName;
    	let pageNameCapitalized;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*page*/ 4) {
    			 pageName = page;
    		}

    		if ($$self.$$.dirty & /*page*/ 4) {
    			 $$invalidate(1, pageNameCapitalized = page[0].toUpperCase() + page.slice(1));
    		}
    	};

    	 $$invalidate(0, users = []);
    	return [users, pageNameCapitalized, page];
    }

    class Directory extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { page: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Directory",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*page*/ ctx[2] === undefined && !("page" in props)) {
    			console.warn("<Directory> was created without expected prop 'page'");
    		}
    	}

    	get page() {
    		throw new Error("<Directory>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set page(value) {
    		throw new Error("<Directory>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var bind = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    /*global toString:true*/

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return toString.call(val) === '[object Array]';
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return (typeof FormData !== 'undefined') && (val instanceof FormData);
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a plain Object
     *
     * @param {Object} val The value to test
     * @return {boolean} True if value is a plain Object, otherwise false
     */
    function isPlainObject(val) {
      if (toString.call(val) !== '[object Object]') {
        return false;
      }

      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.replace(/^\s*/, '').replace(/\s*$/, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     * @return {string} content value without BOM
     */
    function stripBOM(content) {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    }

    var utils = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isPlainObject: isPlainObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      extend: extend,
      trim: trim,
      stripBOM: stripBOM
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn(data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    var enhanceError = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }

      error.request = request;
      error.response = response;
      error.isAxiosError = true;

      error.toJSON = function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code
        };
      };
      return error;
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    var createError = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;

        if (utils.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        // Listen for ready state
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }

          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(resolve, reject, response);

          // Clean up request
          request = null;
        };

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(createError('Request aborted', config, 'ECONNABORTED', request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
            cookies.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (config.responseType) {
          try {
            request.responseType = config.responseType;
          } catch (e) {
            // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
            // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
            if (config.responseType !== 'json') {
              throw e;
            }
          }
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken) {
          // Handle cancellation
          config.cancelToken.promise.then(function onCanceled(cancel) {
            if (!request) {
              return;
            }

            request.abort();
            reject(cancel);
            // Clean up request
            request = null;
          });
        }

        if (!requestData) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      }
      return adapter;
    }

    var defaults = {
      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');
        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }
        if (utils.isObject(data)) {
          setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
          return JSON.stringify(data);
        }
        return data;
      }],

      transformResponse: [function transformResponse(data) {
        /*eslint no-param-reassign:0*/
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) { /* Ignore */ }
        }
        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      }
    };

    defaults.headers = {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults;

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData(
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData(
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData(
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      var valueFromConfig2Keys = ['url', 'method', 'data'];
      var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
      var defaultToConfig2Keys = [
        'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
        'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
        'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
        'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
        'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
      ];
      var directMergeKeys = ['validateStatus'];

      function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge(target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      }

      utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        }
      });

      utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

      utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      utils.forEach(directMergeKeys, function merge(prop) {
        if (prop in config2) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      var axiosKeys = valueFromConfig2Keys
        .concat(mergeDeepPropertiesKeys)
        .concat(defaultToConfig2Keys)
        .concat(directMergeKeys);

      var otherKeys = Object
        .keys(config1)
        .concat(Object.keys(config2))
        .filter(function filterAxiosKeys(key) {
          return axiosKeys.indexOf(key) === -1;
        });

      utils.forEach(otherKeys, mergeDeepProperties);

      return config;
    };

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof config === 'string') {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }

      config = mergeConfig(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      // Hook up interceptors middleware
      var chain = [dispatchRequest, undefined];
      var promise = Promise.resolve(config);

      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        chain.push(interceptor.fulfilled, interceptor.rejected);
      });

      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: (config || {}).data
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, data, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    var Axios_1 = Axios;

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    var Cancel_1 = Cancel;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;
      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    var isAxiosError = function isAxiosError(payload) {
      return (typeof payload === 'object') && (payload.isAxiosError === true);
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      return instance;
    }

    // Create the default instance to be exported
    var axios = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios.Axios = Axios_1;

    // Factory for creating new instances
    axios.create = function create(instanceConfig) {
      return createInstance(mergeConfig(axios.defaults, instanceConfig));
    };

    // Expose Cancel & CancelToken
    axios.Cancel = Cancel_1;
    axios.CancelToken = CancelToken_1;
    axios.isCancel = isCancel;

    // Expose all/spread
    axios.all = function all(promises) {
      return Promise.all(promises);
    };
    axios.spread = spread;

    // Expose isAxiosError
    axios.isAxiosError = isAxiosError;

    var axios_1 = axios;

    // Allow use of default import syntax in TypeScript
    var _default = axios;
    axios_1.default = _default;

    var axios$1 = axios_1;

    /* src/components/Settings.svelte generated by Svelte v3.24.0 */
    const file$8 = "src/components/Settings.svelte";

    // (73:32) 
    function create_if_block_1$1(ctx) {
    	let form_1;
    	let label0;
    	let t1;
    	let input0;
    	let input0_value_value;
    	let t2;
    	let label1;
    	let t4;
    	let input1;
    	let t5;
    	let label2;
    	let t7;
    	let input2;
    	let t8;
    	let label3;
    	let t10;
    	let input3;
    	let t11;
    	let hr;
    	let t12;
    	let button;

    	const block = {
    		c: function create() {
    			form_1 = element("form");
    			label0 = element("label");
    			label0.textContent = "Email";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			label1 = element("label");
    			label1.textContent = "Password";
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			label2 = element("label");
    			label2.textContent = "New Password";
    			t7 = space();
    			input2 = element("input");
    			t8 = space();
    			label3 = element("label");
    			label3.textContent = "Re-type New Password";
    			t10 = space();
    			input3 = element("input");
    			t11 = space();
    			hr = element("hr");
    			t12 = space();
    			button = element("button");
    			button.textContent = "Save";
    			attr_dev(label0, "for", "email");
    			attr_dev(label0, "class", "label svelte-wwqbqr");
    			add_location(label0, file$8, 74, 8, 3002);
    			attr_dev(input0, "class", "input svelte-wwqbqr");
    			attr_dev(input0, "name", "email");
    			input0.value = input0_value_value = /*user*/ ctx[3].email;
    			attr_dev(input0, "type", "email");
    			input0.required = true;
    			add_location(input0, file$8, 75, 8, 3057);
    			attr_dev(label1, "for", "oldPassword");
    			attr_dev(label1, "class", "label svelte-wwqbqr");
    			add_location(label1, file$8, 76, 8, 3143);
    			attr_dev(input1, "class", "input svelte-wwqbqr");
    			attr_dev(input1, "name", "oldPassword");
    			attr_dev(input1, "type", "password");
    			input1.value = "";
    			add_location(input1, file$8, 77, 8, 3207);
    			attr_dev(label2, "for", "newPassword");
    			attr_dev(label2, "class", "label svelte-wwqbqr");
    			add_location(label2, file$8, 78, 8, 3281);
    			attr_dev(input2, "class", "input svelte-wwqbqr");
    			attr_dev(input2, "name", "newPassword");
    			attr_dev(input2, "type", "password");
    			input2.value = "";
    			add_location(input2, file$8, 79, 8, 3349);
    			attr_dev(label3, "for", "newPasswordConfirm");
    			attr_dev(label3, "class", "label svelte-wwqbqr");
    			add_location(label3, file$8, 80, 8, 3423);
    			attr_dev(input3, "class", "input svelte-wwqbqr");
    			attr_dev(input3, "name", "newPasswordConfirm");
    			attr_dev(input3, "type", "password");
    			input3.value = "";
    			add_location(input3, file$8, 81, 8, 3506);
    			attr_dev(hr, "class", "svelte-wwqbqr");
    			add_location(hr, file$8, 82, 8, 3587);
    			attr_dev(button, "class", "button svelte-wwqbqr");
    			attr_dev(button, "type", "submit");
    			button.value = "Submit";
    			attr_dev(button, "id", "editFormSubmit");
    			add_location(button, file$8, 83, 8, 3600);
    			attr_dev(form_1, "id", "edit_form");
    			attr_dev(form_1, "method", "POST");
    			attr_dev(form_1, "action", "/account");
    			attr_dev(form_1, "class", "svelte-wwqbqr");
    			add_location(form_1, file$8, 73, 6, 2940);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form_1, anchor);
    			append_dev(form_1, label0);
    			append_dev(form_1, t1);
    			append_dev(form_1, input0);
    			append_dev(form_1, t2);
    			append_dev(form_1, label1);
    			append_dev(form_1, t4);
    			append_dev(form_1, input1);
    			append_dev(form_1, t5);
    			append_dev(form_1, label2);
    			append_dev(form_1, t7);
    			append_dev(form_1, input2);
    			append_dev(form_1, t8);
    			append_dev(form_1, label3);
    			append_dev(form_1, t10);
    			append_dev(form_1, input3);
    			append_dev(form_1, t11);
    			append_dev(form_1, hr);
    			append_dev(form_1, t12);
    			append_dev(form_1, button);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*user*/ 8 && input0_value_value !== (input0_value_value = /*user*/ ctx[3].email) && input0.value !== input0_value_value) {
    				prop_dev(input0, "value", input0_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(73:32) ",
    		ctx
    	});

    	return block;
    }

    // (45:4) {#if page == "settings"}
    function create_if_block$1(ctx) {
    	let form_1;
    	let div1;
    	let div0;
    	let input0;
    	let t0;
    	let label0;
    	let svg;
    	let title;
    	let t1;
    	let g2;
    	let g1;
    	let g0;
    	let path;
    	let t2;
    	let label1;
    	let t4;
    	let input1;
    	let input1_value_value;
    	let t5;
    	let label2;
    	let t7;
    	let input2;
    	let input2_value_value;
    	let t8;
    	let label3;
    	let t10;
    	let textarea;
    	let textarea_value_value;
    	let t11;
    	let hr;
    	let t12;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form_1 = element("form");
    			div1 = element("div");
    			div0 = element("div");
    			input0 = element("input");
    			t0 = space();
    			label0 = element("label");
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t1 = text("Edit");
    			g2 = svg_element("g");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path = svg_element("path");
    			t2 = space();
    			label1 = element("label");
    			label1.textContent = "Username";
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			label2 = element("label");
    			label2.textContent = "Display name";
    			t7 = space();
    			input2 = element("input");
    			t8 = space();
    			label3 = element("label");
    			label3.textContent = "Bio";
    			t10 = space();
    			textarea = element("textarea");
    			t11 = space();
    			hr = element("hr");
    			t12 = space();
    			button = element("button");
    			button.textContent = "Save";
    			attr_dev(input0, "type", "file");
    			attr_dev(input0, "name", "photo");
    			attr_dev(input0, "id", "photo");
    			attr_dev(input0, "accept", "image/gif, image/png, image/jpeg");
    			attr_dev(input0, "class", "svelte-wwqbqr");
    			add_location(input0, file$8, 48, 12, 1297);
    			add_location(title, file$8, 51, 16, 1610);
    			attr_dev(path, "d", "M61.9,258.010643 L45.1,258.010643 L45.1,242.095788 L53.5,242.095788 L53.5,240.106431 L43,240.106431 L43,260 L64,260 L64,250.053215 L61.9,250.053215 L61.9,258.010643 Z M49.3,249.949769 L59.63095,240 L64,244.114985 L53.3341,254.031929 L49.3,254.031929 L49.3,249.949769 Z");
    			add_location(path, file$8, 55, 22, 1885);
    			attr_dev(g0, "transform", "translate(56.000000, 160.000000)");
    			add_location(g0, file$8, 54, 20, 1814);
    			attr_dev(g1, "transform", "translate(-99.000000, -400.000000)");
    			attr_dev(g1, "fill", "#fff");
    			add_location(g1, file$8, 53, 18, 1731);
    			attr_dev(g2, "stroke", "none");
    			attr_dev(g2, "stroke-width", "1");
    			attr_dev(g2, "fill", "none");
    			attr_dev(g2, "fill-rule", "evenodd");
    			add_location(g2, file$8, 52, 16, 1646);
    			attr_dev(svg, "width", "15px");
    			attr_dev(svg, "height", "15px");
    			attr_dev(svg, "viewBox", "0 0 21 20");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			add_location(svg, file$8, 50, 14, 1449);
    			attr_dev(label0, "for", "photo");
    			attr_dev(label0, "class", "svelte-wwqbqr");
    			add_location(label0, file$8, 49, 12, 1415);
    			attr_dev(div0, "class", "row");
    			add_location(div0, file$8, 47, 10, 1267);
    			attr_dev(div1, "class", "user_img svelte-wwqbqr");
    			set_style(div1, "background-image", "url('http://localhost:5000/assets/uploads/" + (/*user*/ ctx[3].photo || "default.jpg") + "')");
    			add_location(div1, file$8, 46, 8, 1134);
    			attr_dev(label1, "for", "username");
    			attr_dev(label1, "class", "label svelte-wwqbqr");
    			add_location(label1, file$8, 63, 8, 2348);
    			attr_dev(input1, "class", "input svelte-wwqbqr");
    			attr_dev(input1, "name", "username");
    			input1.value = input1_value_value = /*user*/ ctx[3].username || null;
    			input1.required = true;
    			add_location(input1, file$8, 64, 8, 2409);
    			attr_dev(label2, "for", "displayname");
    			attr_dev(label2, "class", "label svelte-wwqbqr");
    			add_location(label2, file$8, 65, 8, 2496);
    			attr_dev(input2, "class", "input svelte-wwqbqr");
    			attr_dev(input2, "name", "displayname");
    			input2.value = input2_value_value = /*user*/ ctx[3].displayname || null;
    			add_location(input2, file$8, 66, 8, 2564);
    			attr_dev(label3, "for", "bio");
    			attr_dev(label3, "class", "label svelte-wwqbqr");
    			add_location(label3, file$8, 67, 8, 2648);
    			attr_dev(textarea, "name", "bio");
    			attr_dev(textarea, "class", "input svelte-wwqbqr");
    			textarea.value = textarea_value_value = /*user*/ ctx[3].bio || null;
    			add_location(textarea, file$8, 68, 8, 2699);
    			attr_dev(hr, "class", "svelte-wwqbqr");
    			add_location(hr, file$8, 69, 8, 2772);
    			attr_dev(button, "class", "button svelte-wwqbqr");
    			attr_dev(button, "type", "submit");
    			button.value = "Submit";
    			add_location(button, file$8, 70, 8, 2785);
    			attr_dev(form_1, "enctype", "multipart/form-data");
    			attr_dev(form_1, "id", "edit_form");
    			attr_dev(form_1, "method", "POST");
    			attr_dev(form_1, "action", "/profile");
    			attr_dev(form_1, "class", "svelte-wwqbqr");
    			add_location(form_1, file$8, 45, 6, 1021);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form_1, anchor);
    			append_dev(form_1, div1);
    			append_dev(div1, div0);
    			append_dev(div0, input0);
    			/*input0_binding*/ ctx[7](input0);
    			append_dev(div0, t0);
    			append_dev(div0, label0);
    			append_dev(label0, svg);
    			append_dev(svg, title);
    			append_dev(title, t1);
    			append_dev(svg, g2);
    			append_dev(g2, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path);
    			append_dev(form_1, t2);
    			append_dev(form_1, label1);
    			append_dev(form_1, t4);
    			append_dev(form_1, input1);
    			append_dev(form_1, t5);
    			append_dev(form_1, label2);
    			append_dev(form_1, t7);
    			append_dev(form_1, input2);
    			append_dev(form_1, t8);
    			append_dev(form_1, label3);
    			append_dev(form_1, t10);
    			append_dev(form_1, textarea);
    			append_dev(form_1, t11);
    			append_dev(form_1, hr);
    			append_dev(form_1, t12);
    			append_dev(form_1, button);
    			/*form_1_binding*/ ctx[8](form_1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(/*formClick*/ ctx[5]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*user*/ 8) {
    				set_style(div1, "background-image", "url('http://localhost:5000/assets/uploads/" + (/*user*/ ctx[3].photo || "default.jpg") + "')");
    			}

    			if (dirty & /*user*/ 8 && input1_value_value !== (input1_value_value = /*user*/ ctx[3].username || null) && input1.value !== input1_value_value) {
    				prop_dev(input1, "value", input1_value_value);
    			}

    			if (dirty & /*user*/ 8 && input2_value_value !== (input2_value_value = /*user*/ ctx[3].displayname || null) && input2.value !== input2_value_value) {
    				prop_dev(input2, "value", input2_value_value);
    			}

    			if (dirty & /*user*/ 8 && textarea_value_value !== (textarea_value_value = /*user*/ ctx[3].bio || null)) {
    				prop_dev(textarea, "value", textarea_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form_1);
    			/*input0_binding*/ ctx[7](null);
    			/*form_1_binding*/ ctx[8](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(45:4) {#if page == \\\"settings\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let title_value;
    	let t;
    	let div1;
    	let div0;
    	document.title = title_value = "Microblogger | " + /*pageNameCapitalized*/ ctx[4];

    	function select_block_type(ctx, dirty) {
    		if (/*page*/ ctx[0] == "settings") return create_if_block$1;
    		if (/*page*/ ctx[0] == "account") return create_if_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			t = space();
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div0, "id", "settingsContainer");
    			attr_dev(div0, "class", "svelte-wwqbqr");
    			add_location(div0, file$8, 43, 2, 957);
    			attr_dev(div1, "id", "settingsModule");
    			attr_dev(div1, "class", "svelte-wwqbqr");
    			add_location(div1, file$8, 42, 0, 929);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if (if_block) if_block.m(div0, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*pageNameCapitalized*/ 16 && title_value !== (title_value = "Microblogger | " + /*pageNameCapitalized*/ ctx[4])) {
    				document.title = title_value;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { page } = $$props;
    	let { currentUser = {} } = $$props;
    	let userForm = {};
    	let body;
    	let photo;
    	let dispatch = createEventDispatcher();

    	let formClick = async e => {
    		let file = photo;
    		let formData = new FormData();
    		formData.append("file", file.files[0]);
    		formData.append("username", form[1].value);
    		formData.append("displayname", form[2].value);
    		formData.append("bio", form[3].value);

    		await axios$1.post("/settings", formData).then(response => {
    			$$invalidate(6, currentUser = response.data);
    			dispatch("userUpdate", response.data);
    			$$invalidate(2, photo.value = null, photo);
    		});
    	};

    	const writable_props = ["page", "currentUser"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Settings> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Settings", $$slots, []);

    	function input0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			photo = $$value;
    			$$invalidate(2, photo);
    		});
    	}

    	function form_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			userForm = $$value;
    			$$invalidate(1, userForm);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("page" in $$props) $$invalidate(0, page = $$props.page);
    		if ("currentUser" in $$props) $$invalidate(6, currentUser = $$props.currentUser);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		axios: axios$1,
    		page,
    		currentUser,
    		userForm,
    		body,
    		photo,
    		dispatch,
    		formClick,
    		user,
    		form,
    		pageName,
    		pageNameCapitalized
    	});

    	$$self.$inject_state = $$props => {
    		if ("page" in $$props) $$invalidate(0, page = $$props.page);
    		if ("currentUser" in $$props) $$invalidate(6, currentUser = $$props.currentUser);
    		if ("userForm" in $$props) $$invalidate(1, userForm = $$props.userForm);
    		if ("body" in $$props) body = $$props.body;
    		if ("photo" in $$props) $$invalidate(2, photo = $$props.photo);
    		if ("dispatch" in $$props) dispatch = $$props.dispatch;
    		if ("formClick" in $$props) $$invalidate(5, formClick = $$props.formClick);
    		if ("user" in $$props) $$invalidate(3, user = $$props.user);
    		if ("form" in $$props) form = $$props.form;
    		if ("pageName" in $$props) pageName = $$props.pageName;
    		if ("pageNameCapitalized" in $$props) $$invalidate(4, pageNameCapitalized = $$props.pageNameCapitalized);
    	};

    	let user;
    	let form;
    	let pageName;
    	let pageNameCapitalized;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*currentUser*/ 64) {
    			 $$invalidate(3, user = currentUser);
    		}

    		if ($$self.$$.dirty & /*userForm*/ 2) {
    			 form = userForm;
    		}

    		if ($$self.$$.dirty & /*page*/ 1) {
    			 pageName = page;
    		}

    		if ($$self.$$.dirty & /*page*/ 1) {
    			 $$invalidate(4, pageNameCapitalized = page[0].toUpperCase() + page.slice(1));
    		}
    	};

    	return [
    		page,
    		userForm,
    		photo,
    		user,
    		pageNameCapitalized,
    		formClick,
    		currentUser,
    		input0_binding,
    		form_1_binding
    	];
    }

    class Settings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { page: 0, currentUser: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*page*/ ctx[0] === undefined && !("page" in props)) {
    			console.warn("<Settings> was created without expected prop 'page'");
    		}
    	}

    	get page() {
    		throw new Error("<Settings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set page(value) {
    		throw new Error("<Settings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentUser() {
    		throw new Error("<Settings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentUser(value) {
    		throw new Error("<Settings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Login.svelte generated by Svelte v3.24.0 */

    const { console: console_1$1 } = globals;
    const file$9 = "src/components/Login.svelte";

    // (123:10) {#if active == true}
    function create_if_block_1$2(ctx) {
    	let input;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", "username");
    			attr_dev(input, "placeholder", "Username");
    			attr_dev(input, "class", "svelte-h3r9cx");
    			add_location(input, file$9, 123, 10, 3243);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			/*input_binding*/ ctx[13](input);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding*/ ctx[13](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(123:10) {#if active == true}",
    		ctx
    	});

    	return block;
    }

    // (130:6) {:else}
    function create_else_block(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Login";
    			attr_dev(button, "class", "button");
    			add_location(button, file$9, 130, 8, 3511);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "focus", /*login*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(130:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (128:6) {#if active == true}
    function create_if_block$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Register";
    			attr_dev(button, "class", "button");
    			add_location(button, file$9, 128, 8, 3424);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "focus", /*authenticate*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(128:6) {#if active == true}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let t0;
    	let div4;
    	let div0;
    	let a0;
    	let span0;
    	let t2;
    	let span2;
    	let t3;
    	let span1;
    	let t5;
    	let div3;
    	let form;
    	let div1;
    	let input0;
    	let t6;
    	let input1;
    	let t7;
    	let input2;
    	let t8;
    	let t9;
    	let t10;
    	let div2;
    	let p0;
    	let t11;
    	let a1;
    	let t13;
    	let p1;
    	let t14;
    	let a2;
    	let mounted;
    	let dispose;
    	let if_block0 = /*active*/ ctx[4] == true && create_if_block_1$2(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*active*/ ctx[4] == true) return create_if_block$2;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			t0 = space();
    			div4 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			span0 = element("span");
    			span0.textContent = "o";
    			t2 = space();
    			span2 = element("span");
    			t3 = text("yea");
    			span1 = element("span");
    			span1.textContent = "h?";
    			t5 = space();
    			div3 = element("div");
    			form = element("form");
    			div1 = element("div");
    			input0 = element("input");
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			input2 = element("input");
    			t8 = space();
    			if (if_block0) if_block0.c();
    			t9 = space();
    			if_block1.c();
    			t10 = space();
    			div2 = element("div");
    			p0 = element("p");
    			t11 = text("New user? ");
    			a1 = element("a");
    			a1.textContent = "Create an account.";
    			t13 = space();
    			p1 = element("p");
    			t14 = text("Forgot password? ");
    			a2 = element("a");
    			a2.textContent = "Reset.";
    			document.title = "Microblogger | Login";
    			attr_dev(span0, "class", "first svelte-h3r9cx");
    			add_location(span0, file$9, 112, 8, 2700);
    			attr_dev(span1, "class", "the_H svelte-h3r9cx");
    			add_location(span1, file$9, 113, 32, 2761);
    			attr_dev(span2, "class", "second svelte-h3r9cx");
    			add_location(span2, file$9, 113, 8, 2737);
    			attr_dev(a0, "id", "theLink");
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "svelte-h3r9cx");
    			add_location(a0, file$9, 111, 6, 2666);
    			attr_dev(div0, "id", "theLinkContainer");
    			attr_dev(div0, "class", "svelte-h3r9cx");
    			add_location(div0, file$9, 110, 4, 2632);
    			attr_dev(input0, "type", "hidden");
    			attr_dev(input0, "name", "loginActive");
    			input0.value = "1";
    			attr_dev(input0, "class", "svelte-h3r9cx");
    			add_location(input0, file$9, 119, 10, 2943);
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "name", "email");
    			attr_dev(input1, "placeholder", "Email address");
    			attr_dev(input1, "class", "svelte-h3r9cx");
    			add_location(input1, file$9, 120, 10, 3028);
    			attr_dev(input2, "type", "password");
    			attr_dev(input2, "name", "password");
    			attr_dev(input2, "placeholder", "Password");
    			attr_dev(input2, "class", "svelte-h3r9cx");
    			add_location(input2, file$9, 121, 10, 3118);
    			attr_dev(div1, "id", "auth_box_bod");
    			add_location(div1, file$9, 118, 8, 2909);
    			attr_dev(form, "method", "POST");
    			attr_dev(form, "action", "/login");
    			attr_dev(form, "class", "svelte-h3r9cx");
    			add_location(form, file$9, 117, 6, 2864);
    			attr_dev(a1, "id", "toggle_auth_box_login");
    			attr_dev(a1, "class", "svelte-h3r9cx");
    			add_location(a1, file$9, 133, 21, 3630);
    			attr_dev(p0, "class", "svelte-h3r9cx");
    			add_location(p0, file$9, 133, 8, 3617);
    			attr_dev(a2, "id", "auth_box_close");
    			attr_dev(a2, "class", "svelte-h3r9cx");
    			add_location(a2, file$9, 134, 28, 3738);
    			attr_dev(p1, "class", "svelte-h3r9cx");
    			add_location(p1, file$9, 134, 8, 3718);
    			attr_dev(div2, "id", "auth_box_foot");
    			attr_dev(div2, "class", "svelte-h3r9cx");
    			add_location(div2, file$9, 132, 6, 3584);
    			attr_dev(div3, "id", "auth_box");
    			attr_dev(div3, "class", "svelte-h3r9cx");
    			add_location(div3, file$9, 116, 4, 2838);
    			attr_dev(div4, "id", "homeModule");
    			attr_dev(div4, "class", "svelte-h3r9cx");
    			add_location(div4, file$9, 109, 2, 2606);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, a0);
    			append_dev(a0, span0);
    			append_dev(a0, t2);
    			append_dev(a0, span2);
    			append_dev(span2, t3);
    			append_dev(span2, span1);
    			append_dev(div4, t5);
    			append_dev(div4, div3);
    			append_dev(div3, form);
    			append_dev(form, div1);
    			append_dev(div1, input0);
    			/*input0_binding*/ ctx[10](input0);
    			append_dev(div1, t6);
    			append_dev(div1, input1);
    			/*input1_binding*/ ctx[11](input1);
    			append_dev(div1, t7);
    			append_dev(div1, input2);
    			/*input2_binding*/ ctx[12](input2);
    			append_dev(div1, t8);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div3, t9);
    			if_block1.m(div3, null);
    			append_dev(div3, t10);
    			append_dev(div3, div2);
    			append_dev(div2, p0);
    			append_dev(p0, t11);
    			append_dev(p0, a1);
    			append_dev(div2, t13);
    			append_dev(div2, p1);
    			append_dev(p1, t14);
    			append_dev(p1, a2);

    			if (!mounted) {
    				dispose = listen_dev(a1, "click", /*loginToggle*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*active*/ ctx[4] == true) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					if_block0.m(div1, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div3, t10);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div4);
    			/*input0_binding*/ ctx[10](null);
    			/*input1_binding*/ ctx[11](null);
    			/*input2_binding*/ ctx[12](null);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function processAjaxData$1(response, urlPath) {
    	window.history.pushState(
    		{
    			"html": response,
    			"pageTitle": response.pageTitle
    		},
    		"",
    		urlPath
    	);
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { page } = $$props;
    	let { user = {} } = $$props;
    	let dispatch = createEventDispatcher();
    	let homeModule;
    	let loginActive;
    	let username;
    	let email;
    	let password;
    	let active = false;
    	let url;
    	let params = {};
    	let body = {};
    	

    	let loginToggle = e => {
    		if (loginActive.value == 1) {
    			$$invalidate(0, loginActive.value = 0, loginActive);
    			$$invalidate(4, active = true);
    		} else {
    			$$invalidate(0, loginActive.value = 1, loginActive);
    			$$invalidate(4, active = false);
    		}
    	};

    	let authenticate = e => {
    		e.target.blur();

    		body = {
    			username: username.value,
    			password: password.value,
    			email: email.value
    		};

    		if (body.username != "" && body.email != "" && body.password != "" && active == true) {
    			let url = "http://localhost:4000/register";

    			let params = {
    				method: "POST",
    				body: JSON.stringify(body),
    				headers: { "Content-Type": "application/json" }
    			};

    			fetch(url, params).then(response => {
    				return response.text();
    			}).then(data => {
    				let res = JSON.parse(data);

    				if (res.response.type == "success") {
    					processAjaxData$1(data, "http://localhost:4000/timeline");
    					dispatch("loadPage", "timeline");
    				} else console.error(res.response);
    			});
    		}

    		
    	};

    	let login = async e => {
    		e.target.blur();
    		body.password = password.value;
    		body.email = email.value;

    		if (body.email != "" && body.password != "" && active == false) {
    			let url = "http://localhost:4000/login";

    			let params = {
    				method: "POST",
    				body: JSON.stringify(body),
    				headers: { "Content-Type": "application/json" }
    			};

    			fetch(url, params).then(response => {
    				return response.text();
    			}).then(async data => {
    				let res;

    				if (data === "Unauthorized") {
    					res = {
    						response: {
    							type: "error",
    							name: "InvalidCredentials",
    							message: "Sorry, that Email/Password combination is not in our system."
    						}
    					};
    				} else res = JSON.parse(data);

    				if (res.response.type == "success") {
    					processAjaxData$1(data, "http://localhost:4000/timeline");
    					dispatch("loadPage", "timeline");
    					$$invalidate(8, user = await isAuthenticated());
    					$$invalidate(8, user = await user.text());
    					dispatch("userLogin", JSON.parse(user));
    				} else console.error(res.response);
    			});
    		}

    		
    	};

    	const writable_props = ["page", "user"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Login", $$slots, []);

    	function input0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			loginActive = $$value;
    			$$invalidate(0, loginActive);
    		});
    	}

    	function input1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			email = $$value;
    			$$invalidate(2, email);
    		});
    	}

    	function input2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			password = $$value;
    			$$invalidate(3, password);
    		});
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			username = $$value;
    			$$invalidate(1, username);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("page" in $$props) $$invalidate(9, page = $$props.page);
    		if ("user" in $$props) $$invalidate(8, user = $$props.user);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		isAuthenticated,
    		page,
    		user,
    		dispatch,
    		homeModule,
    		loginActive,
    		username,
    		email,
    		password,
    		active,
    		url,
    		params,
    		body,
    		processAjaxData: processAjaxData$1,
    		loginToggle,
    		authenticate,
    		login
    	});

    	$$self.$inject_state = $$props => {
    		if ("page" in $$props) $$invalidate(9, page = $$props.page);
    		if ("user" in $$props) $$invalidate(8, user = $$props.user);
    		if ("dispatch" in $$props) dispatch = $$props.dispatch;
    		if ("homeModule" in $$props) homeModule = $$props.homeModule;
    		if ("loginActive" in $$props) $$invalidate(0, loginActive = $$props.loginActive);
    		if ("username" in $$props) $$invalidate(1, username = $$props.username);
    		if ("email" in $$props) $$invalidate(2, email = $$props.email);
    		if ("password" in $$props) $$invalidate(3, password = $$props.password);
    		if ("active" in $$props) $$invalidate(4, active = $$props.active);
    		if ("url" in $$props) url = $$props.url;
    		if ("params" in $$props) params = $$props.params;
    		if ("body" in $$props) body = $$props.body;
    		if ("loginToggle" in $$props) $$invalidate(5, loginToggle = $$props.loginToggle);
    		if ("authenticate" in $$props) $$invalidate(6, authenticate = $$props.authenticate);
    		if ("login" in $$props) $$invalidate(7, login = $$props.login);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		loginActive,
    		username,
    		email,
    		password,
    		active,
    		loginToggle,
    		authenticate,
    		login,
    		user,
    		page,
    		input0_binding,
    		input1_binding,
    		input2_binding,
    		input_binding
    	];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { page: 9, user: 8 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*page*/ ctx[9] === undefined && !("page" in props)) {
    			console_1$1.warn("<Login> was created without expected prop 'page'");
    		}
    	}

    	get page() {
    		throw new Error("<Login>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set page(value) {
    		throw new Error("<Login>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get user() {
    		throw new Error("<Login>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set user(value) {
    		throw new Error("<Login>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Navbar.svelte generated by Svelte v3.24.0 */
    const file$a = "src/components/Navbar.svelte";

    // (40:52) 
    function create_if_block_2$1(ctx) {
    	let span0;
    	let a0;
    	let t1;
    	let span1;
    	let a1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			a0 = element("a");
    			a0.textContent = "Profile";
    			t1 = space();
    			span1 = element("span");
    			a1 = element("a");
    			a1.textContent = "Account";
    			attr_dev(a0, "class", "nav-link svelte-f58ara");
    			attr_dev(a0, "href", "settings");
    			add_location(a0, file$a, 40, 25, 1838);
    			attr_dev(span0, "class", "nav-item");
    			add_location(span0, file$a, 40, 2, 1815);
    			attr_dev(a1, "class", "nav-link svelte-f58ara");
    			attr_dev(a1, "href", "account");
    			add_location(a1, file$a, 41, 25, 1956);
    			attr_dev(span1, "class", "nav-item");
    			add_location(span1, file$a, 41, 2, 1933);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			append_dev(span0, a0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, span1, anchor);
    			append_dev(span1, a1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", prevent_default(/*navbarClick*/ ctx[1]), false, true, false),
    					listen_dev(a1, "click", prevent_default(/*navbarClick*/ ctx[1]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(span1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(40:52) ",
    		ctx
    	});

    	return block;
    }

    // (35:31) 
    function create_if_block_1$3(ctx) {
    	let span0;
    	let a0;
    	let t1;
    	let span1;
    	let a1;
    	let t3;
    	let span2;
    	let a2;
    	let t5;
    	let span3;
    	let a3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			a0 = element("a");
    			a0.textContent = "All";
    			t1 = space();
    			span1 = element("span");
    			a1 = element("a");
    			a1.textContent = "Following";
    			t3 = space();
    			span2 = element("span");
    			a2 = element("a");
    			a2.textContent = "Followers";
    			t5 = space();
    			span3 = element("span");
    			a3 = element("a");
    			a3.textContent = "Mutuals";
    			attr_dev(a0, "class", "nav-link svelte-f58ara");
    			attr_dev(a0, "href", "directory");
    			add_location(a0, file$a, 35, 25, 1311);
    			attr_dev(span0, "class", "nav-item");
    			add_location(span0, file$a, 35, 2, 1288);
    			attr_dev(a1, "class", "nav-link svelte-f58ara");
    			attr_dev(a1, "href", "following");
    			add_location(a1, file$a, 36, 25, 1426);
    			attr_dev(span1, "class", "nav-item");
    			add_location(span1, file$a, 36, 2, 1403);
    			attr_dev(a2, "class", "nav-link svelte-f58ara");
    			attr_dev(a2, "href", "followers");
    			add_location(a2, file$a, 37, 25, 1547);
    			attr_dev(span2, "class", "nav-item");
    			add_location(span2, file$a, 37, 2, 1524);
    			attr_dev(a3, "class", "nav-link svelte-f58ara");
    			attr_dev(a3, "href", "mutuals");
    			add_location(a3, file$a, 38, 25, 1668);
    			attr_dev(span3, "class", "nav-item");
    			add_location(span3, file$a, 38, 2, 1645);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			append_dev(span0, a0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, span1, anchor);
    			append_dev(span1, a1);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, span2, anchor);
    			append_dev(span2, a2);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, span3, anchor);
    			append_dev(span3, a3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", prevent_default(/*navbarClick*/ ctx[1]), false, true, false),
    					listen_dev(a1, "click", prevent_default(/*navbarClick*/ ctx[1]), false, true, false),
    					listen_dev(a2, "click", prevent_default(/*navbarClick*/ ctx[1]), false, true, false),
    					listen_dev(a3, "click", prevent_default(/*navbarClick*/ ctx[1]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(span1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(span2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(span3);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(35:31) ",
    		ctx
    	});

    	return block;
    }

    // (30:0) {#if page === "timeline" || page === "published" || page === "drafts" || page === "liked"}
    function create_if_block$3(ctx) {
    	let span0;
    	let a0;
    	let t1;
    	let span1;
    	let a1;
    	let t3;
    	let span2;
    	let a2;
    	let t5;
    	let span3;
    	let a3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			a0 = element("a");
    			a0.textContent = "Feed";
    			t1 = space();
    			span1 = element("span");
    			a1 = element("a");
    			a1.textContent = "Published";
    			t3 = space();
    			span2 = element("span");
    			a2 = element("a");
    			a2.textContent = "Drafts";
    			t5 = space();
    			span3 = element("span");
    			a3 = element("a");
    			a3.textContent = "Liked";
    			attr_dev(a0, "class", "nav-link svelte-f58ara");
    			attr_dev(a0, "href", "timeline");
    			add_location(a0, file$a, 30, 25, 815);
    			attr_dev(span0, "class", "nav-item");
    			add_location(span0, file$a, 30, 2, 792);
    			attr_dev(a1, "class", "nav-link svelte-f58ara");
    			attr_dev(a1, "href", "published");
    			add_location(a1, file$a, 31, 25, 930);
    			attr_dev(span1, "class", "nav-item");
    			add_location(span1, file$a, 31, 2, 907);
    			attr_dev(a2, "class", "nav-link svelte-f58ara");
    			attr_dev(a2, "href", "drafts");
    			add_location(a2, file$a, 32, 25, 1051);
    			attr_dev(span2, "class", "nav-item");
    			add_location(span2, file$a, 32, 2, 1028);
    			attr_dev(a3, "class", "nav-link svelte-f58ara");
    			attr_dev(a3, "href", "liked");
    			add_location(a3, file$a, 33, 25, 1166);
    			attr_dev(span3, "class", "nav-item");
    			add_location(span3, file$a, 33, 2, 1143);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			append_dev(span0, a0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, span1, anchor);
    			append_dev(span1, a1);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, span2, anchor);
    			append_dev(span2, a2);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, span3, anchor);
    			append_dev(span3, a3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", prevent_default(/*navbarClick*/ ctx[1]), false, true, false),
    					listen_dev(a1, "click", prevent_default(/*navbarClick*/ ctx[1]), false, true, false),
    					listen_dev(a2, "click", prevent_default(/*navbarClick*/ ctx[1]), false, true, false),
    					listen_dev(a3, "click", prevent_default(/*navbarClick*/ ctx[1]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(span1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(span2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(span3);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(30:0) {#if page === \\\"timeline\\\" || page === \\\"published\\\" || page === \\\"drafts\\\" || page === \\\"liked\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let nav;

    	function select_block_type(ctx, dirty) {
    		if (/*page*/ ctx[0] === "timeline" || /*page*/ ctx[0] === "published" || /*page*/ ctx[0] === "drafts" || /*page*/ ctx[0] === "liked") return create_if_block$3;
    		if (/*page*/ ctx[0] === "directory") return create_if_block_1$3;
    		if (/*page*/ ctx[0] === "settings" || /*page*/ ctx[0] === "account") return create_if_block_2$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			if (if_block) if_block.c();
    			attr_dev(nav, "class", "navbar svelte-f58ara");
    			add_location(nav, file$a, 28, 0, 678);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			if (if_block) if_block.m(nav, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(nav, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { page } = $$props;
    	let dispatch = createEventDispatcher();

    	async function navbarClick(e) {
    		let path = e.target.pathname.split("/").slice(1).join("/");

    		let params = {
    			method: "GET",
    			headers: { "Content-Type": "application/json" }
    		};

    		fetch(path, params).then(response => {
    			response = { status: response.status, response };
    			return response;
    		}).then(async data => {
    			let res = await data.response.text();

    			if (data.status === 200) {
    				processAjaxData(res, path);
    				dispatch("loadPage", path);
    			}
    		});
    	}

    	
    	const writable_props = ["page"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", $$slots, []);

    	$$self.$set = $$props => {
    		if ("page" in $$props) $$invalidate(0, page = $$props.page);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		processAjaxData,
    		page,
    		dispatch,
    		navbarClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("page" in $$props) $$invalidate(0, page = $$props.page);
    		if ("dispatch" in $$props) dispatch = $$props.dispatch;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [page, navbarClick];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { page: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*page*/ ctx[0] === undefined && !("page" in props)) {
    			console.warn("<Navbar> was created without expected prop 'page'");
    		}
    	}

    	get page() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set page(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.24.0 */

    const { console: console_1$2 } = globals;

    // (80:50) 
    function create_if_block_3$1(ctx) {
    	let navbar;
    	let t;
    	let settings;
    	let current;

    	navbar = new Navbar({
    			props: { page: /*page*/ ctx[0] },
    			$$inline: true
    		});

    	navbar.$on("loadPage", /*loadPage*/ ctx[2]);

    	settings = new Settings({
    			props: {
    				page: /*page*/ ctx[0],
    				currentUser: /*currentUser*/ ctx[1]
    			},
    			$$inline: true
    		});

    	settings.$on("userUpdate", /*authenticated*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t = space();
    			create_component(settings.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(settings, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const navbar_changes = {};
    			if (dirty & /*page*/ 1) navbar_changes.page = /*page*/ ctx[0];
    			navbar.$set(navbar_changes);
    			const settings_changes = {};
    			if (dirty & /*page*/ 1) settings_changes.page = /*page*/ ctx[0];
    			if (dirty & /*currentUser*/ 2) settings_changes.currentUser = /*currentUser*/ ctx[1];
    			settings.$set(settings_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(settings.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(settings.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(settings, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(80:50) ",
    		ctx
    	});

    	return block;
    }

    // (76:26) 
    function create_if_block_2$2(ctx) {
    	let login;
    	let current;

    	login = new Login({
    			props: { page: /*page*/ ctx[0] },
    			$$inline: true
    		});

    	login.$on("loadPage", /*loadPage*/ ctx[2]);
    	login.$on("userLogin", /*authenticated*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(login.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(login, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const login_changes = {};
    			if (dirty & /*page*/ 1) login_changes.page = /*page*/ ctx[0];
    			login.$set(login_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(login.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(login.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(login, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(76:26) ",
    		ctx
    	});

    	return block;
    }

    // (71:30) 
    function create_if_block_1$4(ctx) {
    	let navbar;
    	let t;
    	let directory;
    	let current;

    	navbar = new Navbar({
    			props: { page: /*page*/ ctx[0] },
    			$$inline: true
    		});

    	navbar.$on("loadPage", /*loadPage*/ ctx[2]);

    	directory = new Directory({
    			props: { page: /*page*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t = space();
    			create_component(directory.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(directory, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const navbar_changes = {};
    			if (dirty & /*page*/ 1) navbar_changes.page = /*page*/ ctx[0];
    			navbar.$set(navbar_changes);
    			const directory_changes = {};
    			if (dirty & /*page*/ 1) directory_changes.page = /*page*/ ctx[0];
    			directory.$set(directory_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(directory.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(directory.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(directory, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(71:30) ",
    		ctx
    	});

    	return block;
    }

    // (65:0) {#if   page == "timeline" || page == "drafts" || page == "published" || page == "liked" }
    function create_if_block$4(ctx) {
    	let navbar;
    	let t;
    	let index;
    	let current;

    	navbar = new Navbar({
    			props: { page: /*page*/ ctx[0] },
    			$$inline: true
    		});

    	navbar.$on("loadPage", /*loadPage*/ ctx[2]);

    	index = new Index({
    			props: { page: /*page*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t = space();
    			create_component(index.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(index, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const navbar_changes = {};
    			if (dirty & /*page*/ 1) navbar_changes.page = /*page*/ ctx[0];
    			navbar.$set(navbar_changes);
    			const index_changes = {};
    			if (dirty & /*page*/ 1) index_changes.page = /*page*/ ctx[0];
    			index.$set(index_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(index.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(index.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(index, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(65:0) {#if   page == \\\"timeline\\\" || page == \\\"drafts\\\" || page == \\\"published\\\" || page == \\\"liked\\\" }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let sections;
    	let t;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	sections = new Sections({
    			props: { page: /*page*/ ctx[0] },
    			$$inline: true
    		});

    	sections.$on("loadPage", /*loadPage*/ ctx[2]);
    	const if_block_creators = [create_if_block$4, create_if_block_1$4, create_if_block_2$2, create_if_block_3$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*page*/ ctx[0] == "timeline" || /*page*/ ctx[0] == "drafts" || /*page*/ ctx[0] == "published" || /*page*/ ctx[0] == "liked") return 0;
    		if (/*page*/ ctx[0] == "directory") return 1;
    		if (/*page*/ ctx[0] == "login") return 2;
    		if (/*page*/ ctx[0] == "settings" || /*page*/ ctx[0] == "account") return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			create_component(sections.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(sections, target, anchor);
    			insert_dev(target, t, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sections_changes = {};
    			if (dirty & /*page*/ 1) sections_changes.page = /*page*/ ctx[0];
    			sections.$set(sections_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sections.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sections.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sections, detaching);
    			if (detaching) detach_dev(t);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { user = {} } = $$props;
    	const homeDirectory = window.location.origin;

    	let pathList = [
    		"timeline",
    		"drafts",
    		"published",
    		"liked",
    		"directory",
    		"login",
    		"settings",
    		"account"
    	];

    	let paths = window.location.href.split(homeDirectory + "/").slice(1);
    	let page = paths[0];

    	let loadPage = e => {
    		$$invalidate(0, page = e.detail);
    	};

    	let authenticated = e => {
    		$$invalidate(4, user = e.detail);
    	};

    	onMount(async () => {
    		$$invalidate(4, user = await isAuthenticated());

    		if (user.status == 200) {
    			$$invalidate(4, user = await user.text());
    			$$invalidate(4, user = JSON.parse(user));
    		}

    		

    		if (!pathList.find(url => url === currentPage)) {
    			let params = {
    				method: "GET",
    				headers: { "Content-Type": "application/json" }
    			};

    			await fetch(`/findUser?${currentPage}`, params).then(response => {
    				if (response.status !== 200) {
    					$$invalidate(0, page = "login");
    					return;
    				}

    				return response.text();
    			}).then(data => console.log(data));
    		}
    	});

    	const writable_props = ["user"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$set = $$props => {
    		if ("user" in $$props) $$invalidate(4, user = $$props.user);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		isAuthenticated,
    		Sections,
    		Index,
    		Directory,
    		Settings,
    		Login,
    		Navbar,
    		user,
    		homeDirectory,
    		pathList,
    		paths,
    		page,
    		loadPage,
    		authenticated,
    		currentUser,
    		currentPage
    	});

    	$$self.$inject_state = $$props => {
    		if ("user" in $$props) $$invalidate(4, user = $$props.user);
    		if ("pathList" in $$props) pathList = $$props.pathList;
    		if ("paths" in $$props) paths = $$props.paths;
    		if ("page" in $$props) $$invalidate(0, page = $$props.page);
    		if ("loadPage" in $$props) $$invalidate(2, loadPage = $$props.loadPage);
    		if ("authenticated" in $$props) $$invalidate(3, authenticated = $$props.authenticated);
    		if ("currentUser" in $$props) $$invalidate(1, currentUser = $$props.currentUser);
    		if ("currentPage" in $$props) currentPage = $$props.currentPage;
    	};

    	let currentUser;
    	let currentPage;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*user*/ 16) {
    			 $$invalidate(1, currentUser = user);
    		}

    		if ($$self.$$.dirty & /*page*/ 1) {
    			 currentPage = page;
    		}
    	};

    	return [page, currentUser, loadPage, authenticated, user];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { user: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get user() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set user(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
