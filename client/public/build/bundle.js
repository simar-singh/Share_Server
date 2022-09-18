
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
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
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
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
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
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
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
            set_current_component(null);
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
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
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
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/Button.svelte generated by Svelte v3.38.2 */

    const file$6 = "src/components/Button.svelte";

    function create_fragment$6(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let div0_style_value;
    	let t1;
    	let p;
    	let t2;
    	let p_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(/*text*/ ctx[0]);
    			t1 = space();
    			p = element("p");
    			t2 = text(/*desc*/ ctx[2]);
    			attr_dev(div0, "class", "txt svelte-r2qkej");

    			attr_dev(div0, "style", div0_style_value = /*hover*/ ctx[3] == false
    			? "color:black"
    			: "color:white");

    			add_location(div0, file$6, 11, 2, 310);
    			attr_dev(div1, "class", "btn svelte-r2qkej");
    			add_location(div1, file$6, 10, 0, 201);
    			attr_dev(p, "class", p_class_value = "" + (null_to_empty(/*up*/ ctx[4] == true ? "up" : "") + " svelte-r2qkej"));
    			add_location(p, file$6, 13, 0, 405);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "pointerout", /*pointerout_handler*/ ctx[5], false, false, false),
    					listen_dev(
    						div1,
    						"click",
    						function () {
    							if (is_function(/*click*/ ctx[1])) /*click*/ ctx[1].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(div1, "pointerover", /*pointerover_handler*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*text*/ 1) set_data_dev(t0, /*text*/ ctx[0]);

    			if (dirty & /*hover*/ 8 && div0_style_value !== (div0_style_value = /*hover*/ ctx[3] == false
    			? "color:black"
    			: "color:white")) {
    				attr_dev(div0, "style", div0_style_value);
    			}

    			if (dirty & /*desc*/ 4) set_data_dev(t2, /*desc*/ ctx[2]);

    			if (dirty & /*up*/ 16 && p_class_value !== (p_class_value = "" + (null_to_empty(/*up*/ ctx[4] == true ? "up" : "") + " svelte-r2qkej"))) {
    				attr_dev(p, "class", p_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			mounted = false;
    			run_all(dispose);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, []);
    	let { text } = $$props;
    	let { click } = $$props;
    	let { desc } = $$props;
    	let hover = false;
    	let up = false;

    	if (desc == "Select directory to make public for other machines") {
    		up = true;
    	}

    	const writable_props = ["text", "click", "desc"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	const pointerout_handler = () => $$invalidate(3, hover = false);
    	const pointerover_handler = () => $$invalidate(3, hover = true);

    	$$self.$$set = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("click" in $$props) $$invalidate(1, click = $$props.click);
    		if ("desc" in $$props) $$invalidate(2, desc = $$props.desc);
    	};

    	$$self.$capture_state = () => ({ text, click, desc, hover, up });

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("click" in $$props) $$invalidate(1, click = $$props.click);
    		if ("desc" in $$props) $$invalidate(2, desc = $$props.desc);
    		if ("hover" in $$props) $$invalidate(3, hover = $$props.hover);
    		if ("up" in $$props) $$invalidate(4, up = $$props.up);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, click, desc, hover, up, pointerout_handler, pointerover_handler];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { text: 0, click: 1, desc: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*text*/ ctx[0] === undefined && !("text" in props)) {
    			console.warn("<Button> was created without expected prop 'text'");
    		}

    		if (/*click*/ ctx[1] === undefined && !("click" in props)) {
    			console.warn("<Button> was created without expected prop 'click'");
    		}

    		if (/*desc*/ ctx[2] === undefined && !("desc" in props)) {
    			console.warn("<Button> was created without expected prop 'desc'");
    		}
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get click() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set click(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get desc() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set desc(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
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

    const route = writable("/");

    /* src/components/Icon.svelte generated by Svelte v3.38.2 */
    const file$5 = "src/components/Icon.svelte";

    // (23:34) 
    function create_if_block_1$1(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "d", "M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1a1 1 0 11-2 0 1 1 0 012 0zM2 13a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm14 1a1 1 0 11-2 0 1 1 0 012 0z");
    			attr_dev(path, "clip-rule", "evenodd");
    			add_location(path, file$5, 24, 10, 881);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "h-5 w-5");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			attr_dev(svg, "fill", "currentColor");
    			add_location(svg, file$5, 23, 8, 774);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(23:34) ",
    		ctx
    	});

    	return block;
    }

    // (18:6) { #if ico == 'Upload' }
    function create_if_block$2(ctx) {
    	let svg;
    	let path0;
    	let path1;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", "M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z");
    			add_location(path0, file$5, 19, 10, 478);
    			attr_dev(path1, "d", "M9 13h2v5a1 1 0 11-2 0v-5z");
    			add_location(path1, file$5, 20, 10, 676);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			attr_dev(svg, "fill", "black");
    			add_location(svg, file$5, 18, 8, 385);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(18:6) { #if ico == 'Upload' }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div4;
    	let div3;
    	let div2;
    	let t0;
    	let div0;
    	let t1;
    	let button;
    	let t2;
    	let div1;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*ico*/ ctx[0] == "Upload") return create_if_block$2;
    		if (/*ico*/ ctx[0] == "Server") return create_if_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	button = new Button({
    			props: {
    				click: /*click*/ ctx[1],
    				text: /*ico*/ ctx[0],
    				desc: /*ico*/ ctx[0] == "Server"
    				? "Start server to access the hacking box's files "
    				: "Send file to the hacking box"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			create_component(button.$$.fragment);
    			t2 = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "gap svelte-ai5y87");
    			add_location(div0, file$5, 27, 6, 1160);
    			attr_dev(div1, "class", "gap svelte-ai5y87");
    			add_location(div1, file$5, 29, 6, 1343);
    			attr_dev(div2, "class", "btn svelte-ai5y87");
    			add_location(div2, file$5, 16, 4, 329);
    			attr_dev(div3, "class", "border svelte-ai5y87");
    			add_location(div3, file$5, 15, 2, 304);
    			attr_dev(div4, "class", "bg svelte-ai5y87");
    			add_location(div4, file$5, 14, 0, 285);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			mount_component(button, div2, null);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div2, t0);
    				}
    			}

    			const button_changes = {};
    			if (dirty & /*ico*/ 1) button_changes.text = /*ico*/ ctx[0];

    			if (dirty & /*ico*/ 1) button_changes.desc = /*ico*/ ctx[0] == "Server"
    			? "Start server to access the hacking box's files "
    			: "Send file to the hacking box";

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);

    			if (if_block) {
    				if_block.d();
    			}

    			destroy_component(button);
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

    function instance$5($$self, $$props, $$invalidate) {
    	let $route;
    	validate_store(route, "route");
    	component_subscribe($$self, route, $$value => $$invalidate(2, $route = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Icon", slots, []);
    	let { ico } = $$props;

    	function click() {
    		if (ico == "Upload") {
    			set_store_value(route, $route = "/upload", $route);
    		} else if (ico == "Server") {
    			set_store_value(route, $route = "/server", $route);
    		} else ;
    	}

    	const writable_props = ["ico"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("ico" in $$props) $$invalidate(0, ico = $$props.ico);
    	};

    	$$self.$capture_state = () => ({ Button, route, ico, click, $route });

    	$$self.$inject_state = $$props => {
    		if ("ico" in $$props) $$invalidate(0, ico = $$props.ico);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [ico, click];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { ico: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*ico*/ ctx[0] === undefined && !("ico" in props)) {
    			console.warn("<Icon> was created without expected prop 'ico'");
    		}
    	}

    	get ico() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ico(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/Root.svelte generated by Svelte v3.38.2 */
    const file$4 = "src/routes/Root.svelte";

    function create_fragment$4(ctx) {
    	let div4;
    	let div0;
    	let icon0;
    	let t0;
    	let div2;
    	let div1;
    	let t1;
    	let div3;
    	let icon1;
    	let current;
    	icon0 = new Icon({ props: { ico: "Server" }, $$inline: true });
    	icon1 = new Icon({ props: { ico: "Upload" }, $$inline: true });

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			create_component(icon0.$$.fragment);
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			t1 = space();
    			div3 = element("div");
    			create_component(icon1.$$.fragment);
    			attr_dev(div0, "class", "section svelte-1nn9bkc");
    			add_location(div0, file$4, 4, 2, 97);
    			attr_dev(div1, "class", "line svelte-1nn9bkc");
    			add_location(div1, file$4, 8, 4, 177);
    			attr_dev(div2, "class", "bg svelte-1nn9bkc");
    			add_location(div2, file$4, 7, 2, 156);
    			attr_dev(div3, "class", "section svelte-1nn9bkc");
    			add_location(div3, file$4, 10, 2, 213);
    			attr_dev(div4, "class", "outer svelte-1nn9bkc");
    			add_location(div4, file$4, 3, 0, 75);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			mount_component(icon0, div0, null);
    			append_dev(div4, t0);
    			append_dev(div4, div2);
    			append_dev(div2, div1);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			mount_component(icon1, div3, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon0.$$.fragment, local);
    			transition_in(icon1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon0.$$.fragment, local);
    			transition_out(icon1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(icon0);
    			destroy_component(icon1);
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

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Root", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Root> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Icon });
    	return [];
    }

    class Root extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Root",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/Back.svelte generated by Svelte v3.38.2 */
    const file$3 = "src/components/Back.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let p;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Back";
    			attr_dev(p, "class", "txt svelte-st24qu");
    			add_location(p, file$3, 7, 4, 153);
    			attr_dev(div, "class", "back svelte-st24qu");
    			add_location(div, file$3, 6, 2, 113);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
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

    function instance$3($$self, $$props, $$invalidate) {
    	let $route;
    	validate_store(route, "route");
    	component_subscribe($$self, route, $$value => $$invalidate(1, $route = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Back", slots, []);

    	function click() {
    		set_store_value(route, $route = "/", $route);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Back> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ route, click, $route });
    	return [click];
    }

    class Back extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Back",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/routes/Server.svelte generated by Svelte v3.38.2 */
    const file$2 = "src/routes/Server.svelte";

    // (49:6) {:else}
    function create_else_block$1(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let div0_style_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = text("Start");
    			attr_dev(div0, "class", "txt svelte-yi513u");

    			attr_dev(div0, "style", div0_style_value = /*hover*/ ctx[1] == false
    			? "color:black"
    			: "color:white");

    			add_location(div0, file$2, 50, 10, 2229);
    			attr_dev(div1, "class", "btn svelte-yi513u");
    			add_location(div1, file$2, 49, 8, 2112);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "pointerout", /*pointerout_handler_1*/ ctx[7], false, false, false),
    					listen_dev(div1, "click", /*click*/ ctx[2], false, false, false),
    					listen_dev(div1, "pointerover", /*pointerover_handler_1*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*hover*/ 2 && div0_style_value !== (div0_style_value = /*hover*/ ctx[1] == false
    			? "color:black"
    			: "color:white")) {
    				attr_dev(div0, "style", div0_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(49:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (44:6) {#if ip !== '' }
    function create_if_block$1(ctx) {
    	let div0;
    	let t0;
    	let b;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let div2;
    	let div1;
    	let t5;
    	let div1_style_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("Server hosted on - ");
    			b = element("b");
    			t1 = text(/*ip*/ ctx[0]);
    			t2 = text(":");
    			t3 = text(port);
    			t4 = space();
    			div2 = element("div");
    			div1 = element("div");
    			t5 = text("Stop");
    			add_location(b, file$2, 44, 75, 1837);
    			attr_dev(div0, "class", "serv svelte-yi513u");
    			add_location(div0, file$2, 44, 8, 1770);
    			attr_dev(div1, "class", "txt svelte-yi513u");

    			attr_dev(div1, "style", div1_style_value = /*hover*/ ctx[1] == false
    			? "color:black"
    			: "color:white");

    			add_location(div1, file$2, 46, 10, 1991);
    			attr_dev(div2, "class", "btn2 svelte-yi513u");
    			add_location(div2, file$2, 45, 8, 1874);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			append_dev(div0, b);
    			append_dev(b, t1);
    			append_dev(b, t2);
    			append_dev(b, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, t5);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "load", /*load_handler*/ ctx[4], false, false, false),
    					listen_dev(div2, "pointerout", /*pointerout_handler*/ ctx[5], false, false, false),
    					listen_dev(div2, "click", /*stop*/ ctx[3], false, false, false),
    					listen_dev(div2, "pointerover", /*pointerover_handler*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ip*/ 1) set_data_dev(t1, /*ip*/ ctx[0]);

    			if (dirty & /*hover*/ 2 && div1_style_value !== (div1_style_value = /*hover*/ ctx[1] == false
    			? "color:black"
    			: "color:white")) {
    				attr_dev(div1, "style", div1_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(44:6) {#if ip !== '' }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div4;
    	let back;
    	let t0;
    	let div3;
    	let div2;
    	let h1;
    	let t2;
    	let div1;
    	let div0;
    	let svg;
    	let path;
    	let t3;
    	let current;
    	back = new Back({ $$inline: true });

    	function select_block_type(ctx, dirty) {
    		if (/*ip*/ ctx[0] !== "") return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			create_component(back.$$.fragment);
    			t0 = space();
    			div3 = element("div");
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Start Server";
    			t2 = space();
    			div1 = element("div");
    			div0 = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t3 = space();
    			if_block.c();
    			attr_dev(h1, "class", "svelte-yi513u");
    			add_location(h1, file$2, 35, 6, 1254);
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "d", "M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1a1 1 0 11-2 0 1 1 0 012 0zM2 13a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm14 1a1 1 0 11-2 0 1 1 0 012 0z");
    			attr_dev(path, "clip-rule", "evenodd");
    			add_location(path, file$2, 39, 12, 1448);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "h-5 w-5");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			attr_dev(svg, "fill", "currentColor");
    			add_location(svg, file$2, 38, 10, 1339);
    			attr_dev(div0, "class", "ico svelte-yi513u");
    			add_location(div0, file$2, 37, 8, 1311);
    			attr_dev(div1, "class", "border svelte-yi513u");
    			add_location(div1, file$2, 36, 6, 1282);
    			attr_dev(div2, "class", "body svelte-yi513u");
    			add_location(div2, file$2, 34, 4, 1229);
    			attr_dev(div3, "class", "outer svelte-yi513u");
    			add_location(div3, file$2, 33, 2, 1205);
    			add_location(div4, file$2, 31, 0, 1186);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			mount_component(back, div4, null);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, h1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, svg);
    			append_dev(svg, path);
    			append_dev(div2, t3);
    			if_block.m(div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(back.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(back.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(back);
    			if_block.d();
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

    const port = 8000;

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Server", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	let ip = "";

    	function click() {
    		return __awaiter(this, void 0, void 0, function* () {
    			let res = yield fetch("/getIP");
    			let json = yield res.json();
    			$$invalidate(0, ip = json);
    			$$invalidate(1, hover = false);
    			yield fetch("/start");
    		});
    	}

    	function stop() {
    		fetch("/stop").then(() => {
    			$$invalidate(0, ip = "");
    			$$invalidate(1, hover = false);
    		});
    	}

    	let hover = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Server> was created with unknown prop '${key}'`);
    	});

    	const load_handler = () => $$invalidate(1, hover = false);
    	const pointerout_handler = () => $$invalidate(1, hover = false);
    	const pointerover_handler = () => $$invalidate(1, hover = true);
    	const pointerout_handler_1 = () => $$invalidate(1, hover = false);
    	const pointerover_handler_1 = () => $$invalidate(1, hover = true);

    	$$self.$capture_state = () => ({
    		__awaiter,
    		Back,
    		route,
    		port,
    		ip,
    		click,
    		stop,
    		hover
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("ip" in $$props) $$invalidate(0, ip = $$props.ip);
    		if ("hover" in $$props) $$invalidate(1, hover = $$props.hover);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		ip,
    		hover,
    		click,
    		stop,
    		load_handler,
    		pointerout_handler,
    		pointerover_handler,
    		pointerout_handler_1,
    		pointerover_handler_1
    	];
    }

    class Server extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Server",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/routes/Upload.svelte generated by Svelte v3.38.2 */
    const file$1 = "src/routes/Upload.svelte";

    // (57:6) {:else}
    function create_else_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Failed to upload file";
    			attr_dev(div, "class", "fin svelte-hgwlub");
    			add_location(div, file$1, 57, 8, 2401);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(57:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (55:27) 
    function create_if_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Successfully uploaded file";
    			attr_dev(div, "class", "fin svelte-hgwlub");
    			add_location(div, file$1, 55, 8, 2329);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(55:27) ",
    		ctx
    	});

    	return block;
    }

    // (51:6) {#if uc == ''}
    function create_if_block(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let div0_style_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = text("Select File");
    			attr_dev(div0, "class", "txt svelte-hgwlub");

    			attr_dev(div0, "style", div0_style_value = /*hover*/ ctx[0] == false
    			? "color:black"
    			: "color:white");

    			add_location(div0, file$1, 52, 10, 2187);
    			attr_dev(div1, "class", "btn svelte-hgwlub");
    			add_location(div1, file$1, 51, 8, 2070);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "pointerout", /*pointerout_handler*/ ctx[5], false, false, false),
    					listen_dev(div1, "click", click, false, false, false),
    					listen_dev(div1, "pointerover", /*pointerover_handler*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*hover*/ 1 && div0_style_value !== (div0_style_value = /*hover*/ ctx[0] == false
    			? "color:black"
    			: "color:white")) {
    				attr_dev(div0, "style", div0_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(51:6) {#if uc == ''}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div4;
    	let back;
    	let t0;
    	let div3;
    	let div2;
    	let h1;
    	let t2;
    	let div1;
    	let div0;
    	let svg;
    	let path0;
    	let path1;
    	let t3;
    	let div2_style_value;
    	let t4;
    	let input;
    	let current;
    	let mounted;
    	let dispose;
    	back = new Back({ $$inline: true });

    	function select_block_type(ctx, dirty) {
    		if (/*uc*/ ctx[2] == "") return create_if_block;
    		if (/*uc*/ ctx[2] == "ok") return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			create_component(back.$$.fragment);
    			t0 = space();
    			div3 = element("div");
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Upload File";
    			t2 = space();
    			div1 = element("div");
    			div0 = element("div");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			t3 = space();
    			if_block.c();
    			t4 = space();
    			input = element("input");
    			attr_dev(h1, "class", "svelte-hgwlub");
    			add_location(h1, file$1, 41, 6, 1577);
    			attr_dev(path0, "d", "M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z");
    			add_location(path0, file$1, 45, 12, 1756);
    			attr_dev(path1, "d", "M9 13h2v5a1 1 0 11-2 0v-5z");
    			add_location(path1, file$1, 46, 12, 1956);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			attr_dev(svg, "fill", "black");
    			add_location(svg, file$1, 44, 10, 1661);
    			attr_dev(div0, "class", "ico svelte-hgwlub");
    			add_location(div0, file$1, 43, 8, 1633);
    			attr_dev(div1, "class", "border svelte-hgwlub");
    			add_location(div1, file$1, 42, 6, 1604);
    			attr_dev(div2, "class", "body svelte-hgwlub");
    			attr_dev(div2, "id", "upload");

    			attr_dev(div2, "style", div2_style_value = /*blue*/ ctx[1] === true
    			? "border-color: blue"
    			: "border-color: black;");

    			add_location(div2, file$1, 40, 4, 1469);
    			attr_dev(div3, "class", "outer svelte-hgwlub");
    			add_location(div3, file$1, 39, 2, 1355);
    			attr_dev(input, "type", "file");
    			attr_dev(input, "id", "file");
    			attr_dev(input, "class", "hidden svelte-hgwlub");
    			add_location(input, file$1, 61, 2, 2480);
    			add_location(div4, file$1, 37, 0, 1336);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			mount_component(back, div4, null);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, h1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(div2, t3);
    			if_block.m(div2, null);
    			append_dev(div4, t4);
    			append_dev(div4, input);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div3, "dragend", /*dragend_handler*/ ctx[7], false, false, false),
    					listen_dev(div3, "dragover", /*dragover_handler*/ ctx[8], false, false, false),
    					listen_dev(div3, "drop", /*drop_handler*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			}

    			if (!current || dirty & /*blue*/ 2 && div2_style_value !== (div2_style_value = /*blue*/ ctx[1] === true
    			? "border-color: blue"
    			: "border-color: black;")) {
    				attr_dev(div2, "style", div2_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(back.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(back.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(back);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
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

    function click() {
    	document.getElementById("file").click();
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Upload", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	let files;
    	let hover = false;
    	let blue = false;
    	let uc = "";

    	function drop(e) {
    		return __awaiter(this, void 0, void 0, function* () {
    			e.preventDefault();
    			files = e.dataTransfer.files;
    			$$invalidate(1, blue = false);
    			let data = new FormData();
    			data.append("files", files[0]);
    			let res = yield fetch("/upload", { method: "POST", body: data });
    			$$invalidate(2, uc = yield res.json());
    		});
    	}

    	function dragOver(e) {
    		e.preventDefault();
    		$$invalidate(1, blue = true);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Upload> was created with unknown prop '${key}'`);
    	});

    	const pointerout_handler = () => $$invalidate(0, hover = false);
    	const pointerover_handler = () => $$invalidate(0, hover = true);
    	const dragend_handler = () => $$invalidate(1, blue = false);
    	const dragover_handler = e => dragOver(e);
    	const drop_handler = e => drop(e);

    	$$self.$capture_state = () => ({
    		__awaiter,
    		Back,
    		files,
    		hover,
    		blue,
    		uc,
    		drop,
    		dragOver,
    		click
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("files" in $$props) files = $$props.files;
    		if ("hover" in $$props) $$invalidate(0, hover = $$props.hover);
    		if ("blue" in $$props) $$invalidate(1, blue = $$props.blue);
    		if ("uc" in $$props) $$invalidate(2, uc = $$props.uc);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		hover,
    		blue,
    		uc,
    		drop,
    		dragOver,
    		pointerout_handler,
    		pointerover_handler,
    		dragend_handler,
    		dragover_handler,
    		drop_handler
    	];
    }

    class Upload extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Upload",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.38.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let switch_instance;
    	let current;
    	var switch_value = /*curr*/ ctx[0];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			add_location(main, file, 36, 0, 1329);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, main, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (switch_value !== (switch_value = /*curr*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, main, null);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (switch_instance) destroy_component(switch_instance);
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
    	let $route;
    	validate_store(route, "route");
    	component_subscribe($$self, route, $$value => $$invalidate(1, $route = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	let curr = Root;

    	onMount(() => __awaiter(void 0, void 0, void 0, function* () {
    		set_store_value(route, $route = "/", $route);
    		$$invalidate(0, curr = Root);
    	}));

    	route.subscribe(() => {
    		switch ($route) {
    			case "/":
    				$$invalidate(0, curr = Root);
    				break;
    			case "/upload":
    				$$invalidate(0, curr = Upload);
    				break;
    			case "/server":
    				$$invalidate(0, curr = Server);
    				break;
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		__awaiter,
    		onMount,
    		Root,
    		Server,
    		Upload,
    		route,
    		curr,
    		$route
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("curr" in $$props) $$invalidate(0, curr = $$props.curr);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [curr];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.querySelector('#svelte-app'),
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
