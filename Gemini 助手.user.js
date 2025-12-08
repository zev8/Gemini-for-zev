// ==UserScript==
// @name         Gemini 助手 (v8.4 线性图标版)
// @namespace    http://tampermonkey.net/
// @version      8.4
// @description  Gemini 增强：图标全面线性化重构，风格极简高级，修复定位与侧边栏误触，支持一键导航。
// @author       GeminiUser
// @match        https://gemini.google.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // --- ID 配置 ---
    const IDS = {
        THEME_PANEL: 'gemini-panel-theme',
        ANCHOR_TOGGLE: 'gemini-anchor-toggle',
        ANCHOR_PANEL: 'gemini-anchor-panel',
        SCROLL_BTN: 'gemini-scroll-btn',
        NAV_PREV_BTN: 'gemini-nav-prev',
        NAV_NEXT_BTN: 'gemini-nav-next',
        STYLE: 'gemini-style-global',
        MODAL: 'gemini-custom-modal'
    };

    // --- 图标库 (SVG) ---
    // 工具：生成 SVG Data URI (自动应用 currentColor 以适应深色/浅色模式)
    const createSvgDataUri = (viewBox, path) =>
        `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`)}`;

    // 这是一个特殊的 Helper，用于那些需要 fill="currentColor" 的旧图标 (保持兼容)
    const createFilledSvgDataUri = (viewBox, path) =>
        `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="currentColor">${path}</svg>`)}`;

    const ICONS = {
        // =========== 保持原样 (使用 createFilledSvgDataUri) ===========
        pinFilled: createFilledSvgDataUri('0 0 1024 1024', '<path d="M648.728381 130.779429a73.142857 73.142857 0 0 1 22.674286 15.433142l191.561143 191.756191a73.142857 73.142857 0 0 1-22.137905 118.564571l-67.876572 30.061715-127.341714 127.488-10.093714 140.239238a73.142857 73.142857 0 0 1-124.684191 46.445714l-123.66019-123.782095-210.724572 211.699809-51.833904-51.614476 210.846476-211.821714-127.926857-128.024381a73.142857 73.142857 0 0 1 46.299428-124.635429l144.237715-10.776381 125.074285-125.220571 29.379048-67.779048a73.142857 73.142857 0 0 1 96.207238-38.034285z m-29.086476 67.120761l-34.913524 80.530286-154.087619 154.331429-171.398095 12.751238 303.323428 303.542857 12.044191-167.399619 156.233143-156.428191 80.384-35.59619-191.585524-191.73181z" p-id="9401"></path>'),
        pinOutline: createFilledSvgDataUri('0 0 1024 1024', '<path d="M648.728381 130.779429a73.142857 73.142857 0 0 1 22.674286 15.433142l191.561143 191.756191a73.142857 73.142857 0 0 1-22.137905 118.564571l-67.876572 30.061715-127.341714 127.488-10.093714 140.239238a73.142857 73.142857 0 0 1-124.684191 46.445714l-123.66019-123.782095-210.724572 211.699809-51.833904-51.614476 210.846476-211.821714-127.926857-128.024381a73.142857 73.142857 0 0 1 46.299428-124.635429l144.237715-10.776381 125.074285-125.220571 29.379048-67.779048a73.142857 73.142857 0 0 1 96.207238-38.034285z" p-id="9572"></path>'),
        download: createFilledSvgDataUri('0 0 1024 1024', '<path d="M937.6 357.7c-38.5-42.6-88.8-72-144.2-84.4-11.7-53.1-39.6-101.4-80.3-138.5C664.3 90.3 601 65.9 535 65.9c-65.8 0-128.8 24.3-177.5 68.4-39.7 36-67.4 82.7-79.8 134.1-61.7 7-118.8 34.5-163.3 79-51.2 51.2-79.8 119-80.8 191.2-1 74.3 28 146.1 80.5 198.7 41.2 41.3 93.2 68 149.6 77.4 24 4 45.9-14.4 45.9-38.8v-1.4c0-19.3-14-35.6-33-38.8-92.4-15.7-162.9-96.4-162.9-193.2 0-108.1 87.9-196 196-196h1.7l36.3 0.3 3.8-36.1c10-94 88.9-164.9 183.6-164.9 95.3 0 174.3 71.4 183.7 166l3.2 32.3 32.2 3.5c99.4 10.8 174.4 94.6 174.4 194.8 0 96.8-70.6 177.4-162.9 193.2-19.1 3.3-33 20.1-33 39.5 0 24.8 22.3 43.5 46.8 39.4 55.9-9.5 107.4-36 148.4-76.9 52.1-52.1 80.8-121.4 80.8-195.1-0.1-68.4-25.3-134.1-71.1-184.8z"/><path d="M557.1 795.1h-72c-2.2 0-4-1.8-4-4V553.8c0-22 18-40 40-40s40 18 40 40v237.3c0 2.2-1.8 4-4 4z"/><path d="M498 729.1c11 16.5 35.2 16.5 46.2 0 5.2-7.7 13.8-12.3 23.1-12.3h63c22.2 0 35.4 24.8 23.1 43.2l-96.6 144.5c-9.5 14.3-22.2 22.1-35.7 22.1-13.5 0-26.2-7.9-35.7-22.1L388.8 760c-12.3-18.5 0.9-43.2 23.1-43.2h63c9.3 0 17.9 4.6 23.1 12.3z"/>'),
        wide: createFilledSvgDataUri('0 0 1024 1024', '<path d="M557.355 525.355h178.688v98.218c0 8.107 9.514 12.8 15.786 7.68l172.502-136.192a9.685 9.685 0 0 0 0-15.274l-172.502-136.32a9.728 9.728 0 0 0-15.786 7.68v98.218H557.355a8.021 8.021 0 0 0-7.979 8.022v59.989c0 4.395 3.584 7.979 7.979 7.979z m-101.334 0H277.376v98.218c0 8.107-9.515 12.8-15.787 7.68L89.088 495.061a9.685 9.685 0 0 1 0-15.274l172.459-136.32c6.4-5.12 15.786-0.512 15.786 7.68v98.218H455.98c4.437 0 8.021 3.627 8.021 8.022v59.989a8.021 8.021 0 0 1-8.021 7.979z"></path>'),
        edit: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xNyAzYTIuODUgMi44MyAwIDEgMSA0IDRMMTcuNSA3LjVsLTQtNGwzLjUtMy41WiIvPjxwYXRoIGQ9Im0xMy41IDcuNS05IDl2NGg0bDktOW0tNC00bDQtNCIvPjwvc3ZnPg==`,
        deleteReal: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0zIDZoMThtLTIgMHYxNGEyIDIgMCAwIDEtMiAyaC04YTIgMiAwIDAgMS0yLTJWNm0zIDBWNGEyIDIgMCAwIDEgMi0yaDRhMiAyIDAgMCAxIDIgMnYyIi8+PHBhdGggZD0iTTEwIDExdjZtNCAwdi02Ii8+PC9zdmc+`,

        // =========== 全新优化：线性、圆润、高级 (7个) ===========
        // 使用 createSvgDataUri 自动添加 stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"

        // 1. 浅色模式 (Sun): 极简太阳，光芒与核心分离
        light: createSvgDataUri('0 0 24 24', '<circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>'),

        // 2. 护眼模式 (Eye): 极简眼睛，柔和曲线
        eyeCare: createSvgDataUri('0 0 24 24', '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'),

        // 3. 舒适模式 (Coffee): 热气腾腾的咖啡杯
        medium: createSvgDataUri('0 0 24 24', '<path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"/>'),

        // 4. 深色模式 (Moon): 极简月牙
        dark: createSvgDataUri('0 0 24 24', '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'),

        // 5. 上一个提问 (Chevron Up): 简洁圆润箭头
        arrowUp: createSvgDataUri('0 0 24 24', '<path d="M18 15l-6-6-6 6"/>'),

        // 6. 下一个提问 (Chevron Down): 简洁圆润箭头
        arrowDown: createSvgDataUri('0 0 24 24', '<path d="M6 9l6 6 6-6"/>'),

        // 7. 滚动到最后 (Arrow to Bar): 箭头指向底线，表达明确
        scrollToBottom: createSvgDataUri('0 0 24 24', '<path d="M12 5v14M19 12l-7 7-7-7M5 19h14"/>')
    };

    // --- 样式定义 ---
    const CSS_RULES = {
        light: '',
        medium: `
            html { filter: invert(0.85) hue-rotate(180deg) brightness(0.9) !important; background: #2d2d2d !important; min-height: 100vh; }
            img, video, canvas, .gds-avatar, iframe { filter: invert(1) hue-rotate(180deg) !important; }
            #${IDS.THEME_PANEL}, #${IDS.ANCHOR_TOGGLE}, .gemini-float-btn, #${IDS.ANCHOR_PANEL}, #${IDS.MODAL} { background: rgba(255,255,255,0.95) !important; box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important; }
            #${IDS.MODAL} input { color: #333 !important; background: #fff !important; }
        `,
        dark: `
            html { filter: invert(0.92) hue-rotate(180deg) brightness(0.95) !important; background: #0d0d0d !important; min-height: 100vh; }
            img, video, canvas, .gds-avatar, iframe { filter: invert(1) hue-rotate(180deg) !important; }
            #${IDS.THEME_PANEL}, #${IDS.ANCHOR_TOGGLE}, .gemini-float-btn, #${IDS.ANCHOR_PANEL}, #${IDS.MODAL} { background: rgba(255,255,255,0.95) !important; box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important; border: 1px solid rgba(0,0,0,0.05) !important; }
            #${IDS.MODAL} input { color: #000 !important; background: #f0f0f0 !important; }
        `,
        eyeCare: `
            html { filter: sepia(0.1) brightness(1.03) contrast(1.03) saturate(0.9) !important; background: #fffff5 !important; }
            #${IDS.THEME_PANEL}, #${IDS.ANCHOR_TOGGLE}, .gemini-float-btn, #${IDS.ANCHOR_PANEL}, #${IDS.MODAL} { filter: sepia(0) !important; background: rgba(255,252,245,0.95) !important; border: 1px solid #e0e0d0 !important; }
            div[data-active="true"] { background: #f0f4db !important; color: #556b2f !important; }
        `,
        common: `
            /* ... (面板美化代码) ... */
            #${IDS.ANCHOR_PANEL} { font-family: 'Google Sans', 'Segoe UI', system-ui, sans-serif !important; border: 1px solid rgba(0,0,0,0.08) !important; backdrop-filter: blur(12px) !important; background: rgba(255, 255, 255, 0.9) !important; box-shadow: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.05) !important; border-radius: 20px !important; }
            #gemini-anchor-header { font-size: 14px !important; letter-spacing: 0.3px !important; color: #1f1f1f !important; border-bottom: 1px solid rgba(0,0,0,0.05) !important; }
            #gemini-anchor-list::-webkit-scrollbar { width: 4px; }
            #gemini-anchor-list::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 4px; }
            #gemini-anchor-list li { margin-bottom: 2px !important; border-radius: 12px !important; transition: background-color 0.15s ease !important; border: 1px solid transparent !important; padding: 2px 4px !important; }
            #gemini-anchor-list li:hover { background-color: rgba(31, 31, 31, 0.05) !important; }
            #gemini-anchor-list li span { font-size: 13px !important; color: #444746 !important; font-weight: 500 !important; }

            /* 悬浮球 (Toggle) 与 浮动按钮 (Float Btn) 的统一视觉 */
            /* 1. 基础容器样式 (尺寸, 圆角, 默认阴影, 背景) */
            #${IDS.ANCHOR_TOGGLE}, .gemini-float-btn {
                position: fixed;
                width: 40px !important;
                height: 40px !important;
                border-radius: 50% !important;
                background-color: rgba(255, 255, 255, 0.8) !important; /* 默认半透明白 */
                box-shadow: 0 2px 6px rgba(0,0,0,0.1) !important; /* 柔和投影 */
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                cursor: pointer !important;
                z-index: 9997 !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                color: #747775 !important; /* 淡灰色图标 */
                border: none !important; /* 无边框 */
            }

            /* 2. 悬浮状态 */
            #${IDS.ANCHOR_TOGGLE}:hover, .gemini-float-btn:hover {
                background-color: #fff !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important; /* 加深投影 */
                transform: translateY(-1px); /* 轻微上浮 */
                color: #444746 !important; /* 稍微深一点的灰 */
            }

            /* 3. 锚点特有状态：有数据时变蓝 */
            #${IDS.ANCHOR_TOGGLE}.has-anchors {
                background-color: #d3e3fd !important;
                color: #0b57d0 !important;
                box-shadow: 0 4px 12px rgba(11, 87, 208, 0.25) !important;
            }
            #${IDS.ANCHOR_TOGGLE}.has-anchors:hover {
                 box-shadow: 0 6px 16px rgba(11, 87, 208, 0.3) !important;
            }

            /* 4. 内部图标容器 (统一微缩到 18px，留白更多) */
            .toggle-icon, .btn-icon {
                width: 18px !important;
                height: 18px !important;
                background-color: currentColor;
                -webkit-mask-size: contain; mask-size: contain;
                -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
                -webkit-mask-position: center; mask-position: center;
                transition: transform 0.2s;
            }

            /* ... (其他样式) ... */
            .gemini-anchor-wrapper { display: flex !important; align-items: center !important; justify-content: center !important; height: 32px !important; width: 32px !important; margin-right: 6px !important; }
            .gemini-anchor-btn-native { background-color: transparent !important; color: #5f6368 !important; border: none !important; border-radius: 50% !important; cursor: pointer !important; display: flex !important; align-items: center !important; justify-content: center !important; width: 32px !important; height: 32px !important; padding: 0 !important; margin: 0 !important; flex: 0 0 auto !important; transition: background-color 0.2s, color 0.2s !important; }
            .gemini-anchor-btn-native:hover { background-color: rgba(60,64,67,.08) !important; color: #1f1f1f !important; }
            .gemini-anchor-btn-native.active { color: #0b57d0 !important; }
            .gemini-anchor-btn-native > div { pointer-events: none !important; }
            .gemini-empty-tip { padding: 40px 20px !important; text-align: center; color: #8e918f !important; font-size: 13px; }
        `
    };

    const el = (tag, styles = {}, parent = null) => {
        const node = document.createElement(tag);
        Object.assign(node.style, styles);
        if (styles.className) node.className = styles.className;
        if (parent) parent.appendChild(node);
        return node;
    };

    const setStyle = (css, id) => {
        let style = document.getElementById(id);
        if (!style) {
            style = el('style');
            style.id = id;
            document.head.appendChild(style);
        }
        style.textContent = css;
    };

    // --- 4. 统一的模态框管理器 (全系美化) ---
    const ModalManager = {
        _createBase(title) {
            const existing = document.getElementById(IDS.MODAL);
            if (existing) existing.remove();
            const overlay = el('div', { position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: '2147483648', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }, document.body);
            overlay.id = IDS.MODAL + '-overlay';
            overlay.onclick = (e) => { if(e.target === overlay) this._close(overlay); };
            const box = el('div', { background: '#fff', padding: '24px', borderRadius: '24px', width: '320px', boxShadow: '0 16px 48px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '20px', transform: 'scale(0.95)', transition: 'transform 0.2s', opacity: '0', animation: 'geminiFadeIn 0.2s forwards' }, overlay);
            const animStyle = el('style', {}, box);
            animStyle.textContent = `@keyframes geminiFadeIn { to { transform: scale(1); opacity: 1; } }`;
            box.id = IDS.MODAL;
            el('div', { fontSize: '18px', fontWeight: '500', color: '#1f1f1f', textAlign: 'center' }, box).textContent = title;
            return { overlay, box };
        },
        _close(overlay) { overlay.remove(); },
        show(title, defaultValue, callback) {
            const { overlay, box } = this._createBase(title);
            const input = el('input', { padding: '12px 16px', borderRadius: '12px', border: '1px solid #e0e0e0', fontSize: '15px', outline: 'none', width: '100%', boxSizing: 'border-box', background: '#f8f9fa', transition: 'all 0.2s' }, box);
            input.onfocus = () => { input.style.background = '#fff'; input.style.borderColor = '#0b57d0'; };
            input.onblur = () => { input.style.background = '#f8f9fa'; input.style.borderColor = '#e0e0e0'; };
            input.value = defaultValue || '';
            const btnGroup = el('div', { display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '4px' }, box);
            this._createBtn(btnGroup, '取消', '#5f6368', '#f1f3f4', () => this._close(overlay));
            this._createBtn(btnGroup, '确定', '#fff', '#0b57d0', () => { const val = input.value.trim(); if (val) { callback(val); this._close(overlay); } });
            input.onkeydown = (e) => { if (e.key === 'Enter') ok.click(); if (e.key === 'Escape') this._close(overlay); };
            setTimeout(() => input.focus(), 50);
        },
        confirm(title, content, onConfirm) {
            const { overlay, box } = this._createBase(title);
            el('div', { fontSize: '14px', color: '#444746', textAlign: 'center', lineHeight: '1.5' }, box).textContent = content;
            const btnGroup = el('div', { display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '4px' }, box);
            this._createBtn(btnGroup, '取消', '#5f6368', '#f1f3f4', () => this._close(overlay));
            this._createBtn(btnGroup, '确定', '#fff', '#0b57d0', () => { onConfirm(); this._close(overlay); });
        },
        _createBtn(parent, text, color, bg, onClick) {
            const btn = el('button', { padding: '10px 24px', borderRadius: '100px', border: 'none', background: bg, color: color, cursor: 'pointer', fontWeight: '500', fontSize: '14px', transition: 'all 0.2s' }, parent);
            btn.textContent = text;
            btn.onclick = onClick;
            btn.onmouseover = () => btn.style.filter = 'brightness(0.95)';
            btn.onmouseout = () => btn.style.filter = 'brightness(1)';
            return btn;
        }
    };

    // --- 主题模块 ---
    const ThemeManager = {
        init() {
            this.updateWide(localStorage.getItem('gemini-wide') === 'true');
            const savedTheme = localStorage.getItem('gemini-theme') || 'light';
            this.applyTheme(savedTheme);
        },
        setTheme(key) { localStorage.setItem('gemini-theme', key); this.applyTheme(key); },
        applyTheme(key) { const css = CSS_RULES['common'] + (CSS_RULES[key] || ''); setStyle(css, IDS.STYLE); },
        updateWide(enable) {
            let style = document.getElementById('gemini-wide-css');
            if (enable) {
                if (!style) {
                    style = el('style');
                    style.id = 'gemini-wide-css';
                    style.textContent = `mat-sidenav-content, .main-content, .conversation-container, [class*="conversation-container"], [class*="main-content"] { max-width: 1800px !important; } .conversation-container { margin: 0 auto !important; }`;
                    document.head.appendChild(style);
                }
            } else if (style) { style.remove(); }
        }
    };

    // --- 导航模块 (精准滚动修复 + 样式统一) ---
    const NavManager = {
        init() {
            this.renderNavBtns();
        },
        getQueries() {
            return Array.from(document.querySelectorAll('user-query'));
        },
        renderNavBtns() {
            // 上一个：位置 bottom: 130px
            if (!document.getElementById(IDS.NAV_PREV_BTN)) {
                this.createBtn(IDS.NAV_PREV_BTN, ICONS.arrowUp, '上一个提问', '130px', () => this.jump(-1));
            }
            // 下一个：位置 bottom: 80px (间距 50px)
            if (!document.getElementById(IDS.NAV_NEXT_BTN)) {
                this.createBtn(IDS.NAV_NEXT_BTN, ICONS.arrowDown, '下一个提问', '80px', () => this.jump(1));
            }
        },
        createBtn(id, iconSvg, title, bottom, onClick) {
            const btn = el('div', {
                position: 'fixed', bottom: bottom, right: '20px', className: 'gemini-float-btn'
            }, document.body);
            btn.id = id;
            btn.title = title;
            // 使用 mask 技术，使图标颜色跟随文字颜色 (currentColor)
            el('div', {
                className: 'btn-icon',
                webkitMaskImage: `url('${iconSvg}')`, maskImage: `url('${iconSvg}')`
            }, btn);
            btn.onclick = (e) => { e.stopPropagation(); onClick(); };
            return btn;
        },
        jump(direction) {
            const queries = this.getQueries();
            if (queries.length === 0) return;

            const viewCenter = window.innerHeight / 3;
            let currentIndex = -1;
            let minDiff = Infinity;

            queries.forEach((q, i) => {
                const rect = q.getBoundingClientRect();
                const diff = Math.abs(rect.top - viewCenter);
                if (diff < minDiff) {
                    minDiff = diff;
                    currentIndex = i;
                }
            });

            let targetIndex = currentIndex + direction;

            // --- 侧边栏排除逻辑 (v7.9) ---
            const getMainScroller = () => {
                const explicit = document.querySelector('infinite-scroller[data-test-id="chat-history-container"]');
                if (explicit) return explicit;
                const scrollers = Array.from(document.querySelectorAll('infinite-scroller'));
                if (scrollers.length === 0) return document.body;
                const candidates = scrollers.filter(el => {
                    return !el.closest('.sidenav-with-history-container') && !el.closest('mat-sidenav');
                });
                if (candidates.length > 0) {
                    candidates.sort((a, b) => b.clientWidth - a.clientWidth);
                    return candidates[0];
                }
                return document.body;
            };

            const scroller = getMainScroller();

            const doScroll = (top) => {
                if (scroller === document.body) window.scrollTo({ top, behavior: 'smooth' });
                else scroller.scrollTo({ top, behavior: 'smooth' });
            };

            if (targetIndex >= 0 && targetIndex < queries.length) {
                queries[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else if (targetIndex < 0) {
                doScroll(0);
            } else if (targetIndex >= queries.length) {
                doScroll(scroller.scrollHeight);
            }
        }
    };

    // --- 锚点模块 ---
    const AnchorManager = {
        data: {},
        init() {
            this.data = JSON.parse(localStorage.getItem('gemini-anchors') || '{}');
            this.renderToggle();
            this.renderScrollBtn();
            this.initObserver();
            this.checkUrl();
            this.initGlobalClick();
            this.updateToggleVisuals();
        },
        initGlobalClick() {
            document.addEventListener('click', (e) => {
                const panel = document.getElementById(IDS.ANCHOR_PANEL);
                const toggle = document.getElementById(IDS.ANCHOR_TOGGLE);
                if (panel && panel.style.visibility === 'visible' && !panel.contains(e.target) && !toggle.contains(e.target)) {
                    this.togglePanel();
                }
            });
        },
        save() {
            localStorage.setItem('gemini-anchors', JSON.stringify(this.data));
            const panel = document.getElementById(IDS.ANCHOR_PANEL);
            if (panel && panel.style.visibility === 'visible') { this.renderPanelList(); }
            this.updateToggleVisuals();
        },
        getCurrentKey() { return window.location.pathname; },
        getScroller() {
            const scrollers = Array.from(document.querySelectorAll('infinite-scroller'));
            const candidates = scrollers.filter(el => !el.closest('.sidenav-with-history-container') && !el.closest('mat-sidenav'));
            if (candidates.length > 0) {
                candidates.sort((a, b) => b.clientWidth - a.clientWidth);
                return candidates[0];
            }
            return document.body;
        },
        updateToggleVisuals() {
            const btn = document.getElementById(IDS.ANCHOR_TOGGLE);
            if (!btn) return;
            const currentKey = this.getCurrentKey();
            const count = (this.data[currentKey] || []).length;
            if (count > 0) { btn.classList.add('has-anchors'); btn.classList.remove('empty'); } else { btn.classList.add('empty'); btn.classList.remove('has-anchors'); }
        },
        renderToggle() {
            if (document.getElementById(IDS.ANCHOR_TOGGLE)) return;
            // 修复 v8.2 定位错误：将样式属性作为对象传递，而不是字符串
            const btn = el('div', {
                top: '50%',
                right: '20px',
                transform: 'translateY(calc(-50% - 50px))'
            }, document.body);

            btn.id = IDS.ANCHOR_TOGGLE;
            btn.title = "跳转到指定回答";
            el('div', {
                className: 'toggle-icon',
                webkitMaskImage: `url('${ICONS.pinFilled}')`, maskImage: `url('${ICONS.pinFilled}')`
            }, btn);
            btn.onclick = (e) => { e.stopPropagation(); this.togglePanel(); };
            this.updateToggleVisuals();
        },
        togglePanel() {
            let panel = document.getElementById(IDS.ANCHOR_PANEL);
            if (!panel) {
                panel = el('div', {
                    position: 'fixed', top: '50%', right: '80px', transform: 'translateY(calc(-50% - 50px))', width: '260px', maxHeight: '70vh',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: '9998', opacity: '0', visibility: 'hidden', transition: 'opacity 0.2s ease, visibility 0.2s'
                }, document.body);
                panel.id = IDS.ANCHOR_PANEL;
                const header = el('div', { padding: '16px 20px', fontWeight: '600', display: 'flex', alignItems: 'center', color: '#1f1f1f' }, panel);
                header.id = 'gemini-anchor-header';
                el('div', { width: '8px', height: '8px', borderRadius: '50%', background: '#0b57d0', marginRight: '12px' }, header);
                el('span', { fontSize: '15px' }, header).textContent = "跳转到指定回答";
                el('ul', { listStyle: 'none', padding: '0 12px', margin: '0', overflowY: 'auto', flexGrow: '1' }, panel).id = 'gemini-anchor-list';
                const footer = el('div', { padding: '16px', background: 'transparent' }, panel);
                const clearBtn = el('button', { width: '100%', padding: '10px', border: 'none', background: '#f8f9fa', color: '#d93025', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '500', transition: 'all 0.2s' }, footer);
                clearBtn.textContent = "清除所有记录";
                clearBtn.onmouseover = () => { clearBtn.style.background = '#fce8e6'; };
                clearBtn.onmouseout = () => { clearBtn.style.background = '#f8f9fa'; };
                clearBtn.onclick = () => {
                    const currentKey = this.getCurrentKey();
                    if (!this.data[currentKey] || this.data[currentKey].length === 0) return;
                    ModalManager.confirm('确认清除', '确定要清空本页所有回答标记吗？此操作无法撤销。', () => {
                        delete this.data[currentKey];
                        this.save();
                        this.refreshAllInlineButtons();
                    });
                };
            }
            const isVisible = panel.style.visibility === 'visible';
            panel.style.visibility = isVisible ? 'hidden' : 'visible';
            panel.style.opacity = isVisible ? '0' : '1';
            const toggleBtn = document.getElementById(IDS.ANCHOR_TOGGLE);
            if(toggleBtn) toggleBtn.style.filter = isVisible ? 'brightness(0.9)' : 'brightness(1)';
            if (!isVisible) this.renderPanelList();
        },
        renderPanelList() {
            const list = document.getElementById('gemini-anchor-list');
            if (!list) return;
            while (list.firstChild) list.removeChild(list.firstChild);
            const anchors = this.data[this.getCurrentKey()] || [];
            if (anchors.length === 0) {
                const emptyTip = el('li'); emptyTip.className = 'gemini-empty-tip'; emptyTip.textContent = '暂无标记的回答'; list.appendChild(emptyTip); return;
            }
            anchors.forEach((anchor, index) => {
                const li = el('li', { display: 'flex', alignItems: 'center', padding: '0', marginBottom: '4px', borderRadius: '8px', background: 'transparent', cursor: 'pointer' }, list);
                const link = el('span', { flexGrow: '1', fontSize: '14px', color: '#444746', padding: '12px 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, li);
                link.textContent = anchor.name;
                link.onclick = () => {
                    const target = document.getElementById(anchor.id);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        target.style.transition = 'background 0.5s';
                        const oldBg = target.style.backgroundColor;
                        target.style.backgroundColor = 'rgba(11, 87, 208, 0.1)';
                        setTimeout(() => target.style.backgroundColor = oldBg, 1500);
                    } else {
                        setTimeout(() => {
                            const retryTarget = document.getElementById(anchor.id);
                            if(retryTarget) retryTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            else alert('未找到该回答');
                        }, 500);
                    }
                };
                const actionDiv = el('div', { display: 'flex', alignItems: 'center', gap: '4px' }, li);
                const editBtn = el('div', { width: '28px', height: '28px', cursor: 'pointer', color: '#5f6368', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'background 0.2s' }, actionDiv);
                el('div', { width: '16px', height: '16px', backgroundColor: 'currentColor', webkitMaskImage: `url('${ICONS.edit}')`, maskImage: `url('${ICONS.edit}')`, webkitMaskSize: 'contain', maskRepeat: 'no-repeat' }, editBtn);
                editBtn.onmouseover = () => { editBtn.style.backgroundColor = 'rgba(0,0,0,0.05)'; editBtn.style.color = '#0b57d0'; };
                editBtn.onmouseout = () => { editBtn.style.backgroundColor = 'transparent'; editBtn.style.color = '#5f6368'; };
                editBtn.onclick = (e) => { e.stopPropagation(); ModalManager.show('重命名回答', anchor.name, (newName) => { this.data[this.getCurrentKey()][index].name = newName; this.save(); this.renderPanelList(); }); };
                const delBtn = el('div', { width: '28px', height: '28px', cursor: 'pointer', color: '#5f6368', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'background 0.2s' }, actionDiv);
                el('div', { width: '16px', height: '16px', backgroundColor: 'currentColor', webkitMaskImage: `url('${ICONS.deleteReal}')`, maskImage: `url('${ICONS.deleteReal}')`, webkitMaskSize: 'contain', maskRepeat: 'no-repeat' }, delBtn);
                delBtn.onmouseover = () => { delBtn.style.backgroundColor = '#fce8e6'; delBtn.style.color = '#d93025'; };
                delBtn.onmouseout = () => { delBtn.style.backgroundColor = 'transparent'; delBtn.style.color = '#5f6368'; };
                delBtn.onclick = (e) => {
                    e.stopPropagation(); this.data[this.getCurrentKey()].splice(index, 1); this.save(); this.renderPanelList();
                    const el = document.getElementById(anchor.id); if(el) { const btn = el.querySelector('.gemini-anchor-btn-native'); if(btn) this.updateInlineBtnState(btn, false); }
                };
            });
        },
        renderScrollBtn() {
            // 滚动到底部：位置 bottom: 30px
            if (document.getElementById(IDS.SCROLL_BTN)) return;
            const btn = el('div', {
                position: 'fixed', bottom: '30px', right: '20px', className: 'gemini-float-btn'
            }, document.body);
            btn.id = IDS.SCROLL_BTN;
            btn.title = "滚动到底部";
            el('div', {
                className: 'btn-icon',
                webkitMaskImage: `url('${ICONS.scrollToBottom}')`, maskImage: `url('${ICONS.scrollToBottom}')`
            }, btn);
            btn.onclick = () => {
                const scroller = this.getScroller();
                if(scroller === document.body) window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                else scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' });
            };
        },
        injectBtn(node, actionBar) {
            if (actionBar.querySelector('.gemini-anchor-wrapper') || node.querySelector('.gemini-anchor-wrapper')) return;
            const wrapper = el('div', { className: 'gemini-anchor-wrapper' });
            wrapper.className = 'gemini-anchor-wrapper';
            const btn = document.createElement('button');
            btn.className = 'gemini-anchor-btn-native';
            btn.setAttribute('aria-label', '标记此回答');
            el('div', { width: '18px', height: '18px', backgroundColor: 'currentColor', webkitMaskImage: `url('${ICONS.pinFilled}')`, maskImage: `url('${ICONS.pinFilled}')`, webkitMaskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }, btn);
            wrapper.appendChild(btn);
            const isAdded = (this.data[this.getCurrentKey()] || []).some(a => a.id === node.id);
            this.updateInlineBtnState(btn, isAdded);
            btn.onclick = (e) => {
                e.stopPropagation(); e.preventDefault();
                if(!node.id) node.id = `gen-anchor-${Math.random().toString(36).substr(2, 9)}`;
                const currentAnchors = this.data[this.getCurrentKey()] || [];
                const existingIndex = currentAnchors.findIndex(a => a.id === node.id);
                if (existingIndex !== -1) {
                    ModalManager.confirm('移除标记', '是否取消标记此回答？', () => { currentAnchors.splice(existingIndex, 1); this.data[this.getCurrentKey()] = currentAnchors; this.save(); this.updateInlineBtnState(btn, false); });
                } else {
                    ModalManager.show('标记回答', `回答 ${currentAnchors.length + 1}`, (name) => {
                        if (!this.data[this.getCurrentKey()]) this.data[this.getCurrentKey()] = [];
                        this.data[this.getCurrentKey()].push({ id: node.id, name }); this.save(); this.updateInlineBtnState(btn, true);
                    });
                }
            };
            let targetContainer = node.querySelector('.buttons-container-v2');
            if (!targetContainer) {
                const knownBtn = node.querySelector('thumb-up-button, copy-button, [data-test-id="more-menu-button"]');
                if (knownBtn) { targetContainer = knownBtn.closest('.buttons-container-v2') || knownBtn.closest('.actions-container-v2'); }
            }
            if (targetContainer) { if (!targetContainer.querySelector('.gemini-anchor-wrapper')) { targetContainer.insertBefore(wrapper, targetContainer.firstChild); } } else { actionBar.appendChild(wrapper); }
        },
        updateInlineBtnState(btn, active) {
            const icon = btn.firstChild;
            if (active) {
                icon.style.webkitMaskImage = `url('${ICONS.pinOutline}')`; icon.style.maskImage = `url('${ICONS.pinOutline}')`; btn.classList.add('active'); btn.title = "已标记 (点击移除)";
            } else {
                icon.style.webkitMaskImage = `url('${ICONS.pinFilled}')`; icon.style.maskImage = `url('${ICONS.pinFilled}')`; btn.classList.remove('active'); btn.title = "标记此回答";
            }
        },
        refreshAllInlineButtons() { document.querySelectorAll('.gemini-anchor-btn-native').forEach(btn => { const parent = btn.closest('model-response'); if(parent) { const isAdded = (this.data[this.getCurrentKey()] || []).some(a => a.id === parent.id); this.updateInlineBtnState(btn, isAdded); } }); },
        assignId(node) {
            if (node.id) return;
            const content = node.querySelector('[id^="message-content-"]');
            if (content && content.id) { node.id = content.id.replace('message-content-', 'model-resp-'); }
        },
        robustInject(node) {
            if (!node || node.dataset.anchorPolling) return;
            node.dataset.anchorPolling = 'true';
            this.assignId(node);
            const findContainer = () => node.querySelector('.buttons-container-v2, .actions-container-v2, .buttons-container');
            if (!node.id || !findContainer()) {
                let attempts = 0;
                const interval = setInterval(() => {
                    attempts++; this.assignId(node); const actionBar = findContainer();
                    if (node.id && actionBar) { clearInterval(interval); this.injectBtn(node, actionBar); delete node.dataset.anchorPolling; } else if (attempts > 50) { clearInterval(interval); delete node.dataset.anchorPolling; }
                }, 200);
            } else { const actionBar = findContainer(); this.injectBtn(node, actionBar); delete node.dataset.anchorPolling; }
        },
        initObserver() {
            document.querySelectorAll('model-response').forEach(el => this.robustInject(el));
            const observer = new MutationObserver(mutations => {
                const processed = new Set();
                mutations.forEach(m => {
                    m.addedNodes.forEach(n => {
                        if (n.nodeType === 1) {
                            if (n.tagName === 'MODEL-RESPONSE') processed.add(n);
                            if (n.querySelectorAll) n.querySelectorAll('model-response').forEach(el => processed.add(el));
                        }
                    });
                    if (m.target && (m.target.classList?.contains('buttons-container-v2') || m.target.tagName === 'MESSAGE-ACTIONS')) { const modelResp = m.target.closest('model-response'); if (modelResp) processed.add(modelResp); }
                });
                processed.forEach(el => this.robustInject(el));
            });
            observer.observe(document.body, { childList: true, subtree: true });
        },
        checkUrl() {
            let lastPath = window.location.pathname;
            setInterval(() => {
                if (window.location.pathname !== lastPath) {
                    lastPath = window.location.pathname;
                    setTimeout(() => { this.renderPanelList(); this.updateToggleVisuals(); document.querySelectorAll('model-response').forEach(el => this.robustInject(el)); }, 500);
                }
            }, 1000);
        }
    };

    // --- 导出模块 ---
    const ExportManager = {
        doExport() {
            let nodes = document.querySelectorAll('[data-test-id="user-query"], [data-test-id="model-response"]');
            if (!nodes.length) nodes = document.querySelectorAll('.user-query, .model-response, .markdown, .query-content');
            if (!nodes.length) nodes = document.querySelectorAll('main p, main li, main code');
            if (!nodes.length) return alert('导出失败：无法抓取内容');
            let md = `# Gemini Chat Export\n> Time: ${new Date().toLocaleString()}\n\n---\n\n`;
            let last = '';
            nodes.forEach(n => {
                const text = (n.innerText || n.textContent).trim();
                if (text.length < 2 || ['Show drafts', 'Listen', 'share'].includes(text) || text === last) return;
                let role = 'Note';
                const check = (el) => {
                    const id = el.getAttribute('data-test-id');
                    if (id === 'user-query') return 'User';
                    if (id === 'model-response') return 'Gemini';
                    const cls = el.className || '';
                    if (cls.includes && (cls.includes('user') || cls.includes('query'))) return 'User';
                    if (cls.includes && (cls.includes('model') || cls.includes('mark'))) return 'Gemini';
                    return null;
                };
                role = check(n);
                if (!role && n.closest) { const pUser = n.closest('[data-test-id="user-query"], .user-query'); const pGemini = n.closest('[data-test-id="model-response"], .model-response'); if (pUser) role = 'User'; else if (pGemini) role = 'Gemini'; }
                if (role === 'User') md += `### User\n`; else if (role === 'Gemini') md += `### Gemini\n`;
                md += `${text}\n\n---\n\n`; last = text;
            });
            const blob = new Blob([md], { type: 'text/markdown' });
            const a = el('a', { display: 'none' }, document.body);
            a.href = URL.createObjectURL(blob);
            a.download = `${(document.title || 'Gemini_Chat').replace(/[\\/:*?"<>|]/g, '_')}.md`;
            a.click();
            setTimeout(() => { a.remove(); URL.revokeObjectURL(a.href); }, 100);
        }
    };

    // --- 主面板 ---
    const MainPanel = {
        init() {
            if (document.getElementById(IDS.THEME_PANEL)) return;
            const panel = el('div', {
                position: 'fixed', bottom: '200px', right: '24px', display: 'flex', flexDirection: 'column', gap: '8px',
                zIndex: '2147483647', background: 'rgba(255,255,255,0.9)', padding: '6px 5px',
                borderRadius: '50px', boxShadow: '0 2px 10px rgba(0,0,0,0.12)', backdropFilter: 'blur(8px)',
                transition: 'opacity 0.3s'
            }, document.body);
            panel.id = IDS.THEME_PANEL;
            this.addBtn(panel, 'light', '浅色模式', 'theme');
            this.addBtn(panel, 'eyeCare', '护眼模式', 'theme');
            this.addBtn(panel, 'medium', '舒适模式', 'theme');
            this.addBtn(panel, 'dark', '深色模式', 'theme');
            el('div', { width: '70%', height: '1px', background: 'rgba(0,0,0,0.1)', margin: '2px auto' }, panel);
            this.addBtn(panel, 'wide', '宽屏模式 (1800px)', 'toggle');
            this.addBtn(panel, 'download', '导出 Markdown', 'action');
            this.updateActive();
        },
        addBtn(panel, key, title, type) {
            const btn = el('div', { width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#5f6368', transition: 'transform 0.2s, background 0.2s' }, panel);
            btn.title = title; btn.dataset.mode = key; btn.dataset.type = type;
            el('div', { width: '14px', height: '14px', backgroundColor: 'currentColor', pointerEvents: 'none', webkitMaskImage: `url('${ICONS[key]}')`, maskImage: `url('${ICONS[key]}')`, webkitMaskSize: 'cover', maskSize: 'cover' }, btn);
            btn.onmouseover = () => { if(btn.dataset.active !== 'true') { btn.style.background = 'rgba(0,0,0,0.05)'; btn.style.transform = 'scale(1.1)'; }};
            btn.onmouseout = () => { if(btn.dataset.active !== 'true') { btn.style.background = 'transparent'; btn.style.transform = 'scale(1)'; }};
            btn.onclick = (e) => {
                e.stopPropagation();
                if (type === 'action') return ExportManager.doExport();
                if (type === 'toggle') { const newState = !(localStorage.getItem(`gemini-${key}`) === 'true'); localStorage.setItem(`gemini-${key}`, newState); ThemeManager.updateWide(newState); } else { ThemeManager.setTheme(key); }
                this.updateActive();
            };
        },
        updateActive() {
            const panel = document.getElementById(IDS.THEME_PANEL);
            if(!panel) return;
            const currentTheme = localStorage.getItem('gemini-theme') || 'light';
            const isWide = localStorage.getItem('gemini-wide') === 'true';
            panel.querySelectorAll('div[data-mode]').forEach(btn => {
                const { mode, type } = btn.dataset;
                let active = false;
                if (type === 'theme') active = (mode === currentTheme);
                if (mode === 'wide') active = isWide;
                btn.dataset.active = active;
                btn.style.background = active ? '#e8f0fe' : 'transparent';
                btn.style.color = active ? '#1a73e8' : '#5f6368';
                btn.style.boxShadow = active ? 'inset 0 0 0 1px #d2e3fc' : 'none';
            });
        }
    };

    // --- 启动 ---
    const start = () => {
        ['gemini-theme-panel', 'gemini-panel-lite'].forEach(id => { const old = document.getElementById(id); if(old) old.remove(); });
        ThemeManager.init();
        MainPanel.init();
        AnchorManager.init();
        NavManager.init();
        new MutationObserver(() => {
            if (!document.getElementById(IDS.THEME_PANEL)) MainPanel.init();
            if (!document.getElementById(IDS.ANCHOR_TOGGLE)) AnchorManager.renderToggle();
            if (!document.getElementById(IDS.NAV_PREV_BTN)) NavManager.renderNavBtns();
        }).observe(document.body, { childList: true, subtree: true });
    };
    setTimeout(start, 500);
})();
