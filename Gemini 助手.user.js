// ==UserScript==
// @name         Gemini 助手
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Gemini 增强：去除数字角标，保留图标反转与悬浮球状态提示，全系美化弹窗。
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
        STYLE: 'gemini-style-global',
        MODAL: 'gemini-custom-modal'
    };

    // --- 图标库 (SVG) ---
    const createSvgDataUri = (viewBox, path) =>
        `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="currentColor">${path}</svg>`)}`;

    const ICONS = {
        // 跳转按钮 (实心图钉)
        pinFilled: createSvgDataUri('0 0 1024 1024', '<path d="M648.728381 130.779429a73.142857 73.142857 0 0 1 22.674286 15.433142l191.561143 191.756191a73.142857 73.142857 0 0 1-22.137905 118.564571l-67.876572 30.061715-127.341714 127.488-10.093714 140.239238a73.142857 73.142857 0 0 1-124.684191 46.445714l-123.66019-123.782095-210.724572 211.699809-51.833904-51.614476 210.846476-211.821714-127.926857-128.024381a73.142857 73.142857 0 0 1 46.299428-124.635429l144.237715-10.776381 125.074285-125.220571 29.379048-67.779048a73.142857 73.142857 0 0 1 96.207238-38.034285z m-29.086476 67.120761l-34.913524 80.530286-154.087619 154.331429-171.398095 12.751238 303.323428 303.542857 12.044191-167.399619 156.233143-156.428191 80.384-35.59619-191.585524-191.73181z" p-id="9401"></path>'),

        // 标记按钮 (描边图钉)
        pinOutline: createSvgDataUri('0 0 1024 1024', '<path d="M648.728381 130.779429a73.142857 73.142857 0 0 1 22.674286 15.433142l191.561143 191.756191a73.142857 73.142857 0 0 1-22.137905 118.564571l-67.876572 30.061715-127.341714 127.488-10.093714 140.239238a73.142857 73.142857 0 0 1-124.684191 46.445714l-123.66019-123.782095-210.724572 211.699809-51.833904-51.614476 210.846476-211.821714-127.926857-128.024381a73.142857 73.142857 0 0 1 46.299428-124.635429l144.237715-10.776381 125.074285-125.220571 29.379048-67.779048a73.142857 73.142857 0 0 1 96.207238-38.034285z" p-id="9572"></path>'),

        edit: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xNyAzYTIuODUgMi44MyAwIDEgMSA0IDRMMTcuNSA3LjVsLTQtNGwzLjUtMy41WiIvPjxwYXRoIGQ9Im0xMy41IDcuNS05IDl2NGg0bDktOW0tNC00bDQtNCIvPjwvc3ZnPg==`,
        deleteReal: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xNyAzYTIuODUgMi44MyAwIDEgMSA0IDRMMTcuNSA3LjVsLTQtNGwzLjUtMy41WiIvPjxwYXRoIGQ9Im0xMy41IDcuNS05IDl2NGg0bDktOW0tNC00bDQtNCIvPjwvc3ZnPg==`,
        // 为了兼容旧代码引用，虽然deleteReal是主要的
        delete: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0zIDZoMThtLTIgMHYxNGEyIDIgMCAwIDEtMiAyaC04YTIgMiAwIDAgMS0yLTJWNm0zIDBWNGEyIDIgMCAwIDEgMi0yaDRhMiAyIDAgMCAxIDIgMnYyIi8+PHBhdGggZD0iTTEwIDExdjZtNCAwdi02Ii8+PC9zdmc+`,

        light: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI1Ii8+PGxpbmUgeDE9IjEyIiB5MT0iMSIgeDI9IjEyIiB5Mj0iMyIvPjxsaW5lIHgxPSIxMiIgeTE9IjIxIiB4Mj0iMTIiIHkyPSIyMyIvPjxsaW5lIHgxPSI0LjIyIiB5MT0iNC4yMiIgeDI9IjUuNjQiIHkyPSI1LjY0Ii8+PGxpbmUgeDE9IjE4LjM2IiB5MT0iMTguMzYiIHgyPSIxOS43OCIgeTI9IjE5Ljc4Ii8+PGxpbmUgeDE9IjEiIHkxPSIxMiIgeDI9IjMiIHkyPSIxMiIvPjxsaW5lIHgxPSIyMSIgeTE9IjEyIiB4Mj0iMjMiIHkyPSIxMiIvPjxsaW5lIHgxPSI0LjIyIiB5MT0iMTkuNzgiIHgyPSI1LjY0IiB5Mj0iMTguMzYiLz48bGluZSB4MT0iMTguMzYiIHkxPSI1LjY0IiB4Mj0iMTkuNzgiIHkyPSI0LjIyIi8+PC9zdmc+`,
        medium: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTIgM3YxIi8+PHBhdGggZD0iTTE4LjUgMTAuNWE2LjUgNi41IDAgMSAxLTEzIDAgNi41IDYuNSAwIDAgMCAxMyAweiIvPjwvc3ZnPg==`,
        dark: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjEgMTIuNzlBOSA5IDAgMSAxIDExLjIxIDMgNyA3IDAgMCAwIDIxIDEyLjc5eiIvPjwvc3ZnPg==`,
        eyeCare: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMSAxMnM0LTggMTEtOCAxMSA4IDExIDgtNCA4LTExIDgtMTEtOC0xMS04eiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjMiLz48L3N2Zz4=`,
        wide: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTUgM2g2djZNMSA5VjN2Nk05IDIxbDMtMyAzIDNNOSAzbDMgMyAzLTNNMTQgMjFoN3YtNk0xIDE1djZoNiIvPjwvc3ZnPg==`,
        download: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjEgMTV2NGEyIDIgMCAwIDEtMiAyaC01bC01IDV2LTVINWEyIDIgMCAwIDEtMi0yVjNhMiAyIDAgMCAxIDItMmgxNGEyIDIgMCAwIDEgMiAyeiIvPjxwYXRoIGQ9Ik0xMiAxMnY2Ii8+PHBhdGggZD0iTTE1IDE1bC0zIDMtMy0zIi8+PC9zdmc+`,
        bookmarkAdded: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xOSAyMWwtNy01LTcgNVYzYTIgMiAwIDAgMSAyLTJoMTBhMiAyIDAgMCAxIDIgMnoiLz48L3N2Zz4=`,
        arrowDown: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48bGluZSB4MT0iMTIiIHkxPSI1IiB4Mj0iMTIiIHkyPSIxOSIvPjxwb2x5bGluZSBwb2ludHM9IjE5IDEyIDEyIDE5IDUgMTIiLz48L3N2Zz4=`
    };

    // --- 样式定义 ---
    const CSS_RULES = {
        light: '',
        medium: `
            html { filter: invert(0.85) hue-rotate(180deg) brightness(0.9) !important; background: #2d2d2d !important; min-height: 100vh; }
            img, video, canvas, .gds-avatar, iframe { filter: invert(1) hue-rotate(180deg) !important; }
            #${IDS.THEME_PANEL}, #${IDS.ANCHOR_TOGGLE}, #${IDS.SCROLL_BTN}, #${IDS.ANCHOR_PANEL}, #${IDS.MODAL} { background: rgba(255,255,255,0.95) !important; box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important; }
            #${IDS.MODAL} input { color: #333 !important; background: #fff !important; }
        `,
        dark: `
            html { filter: invert(0.92) hue-rotate(180deg) brightness(0.95) !important; background: #0d0d0d !important; min-height: 100vh; }
            img, video, canvas, .gds-avatar, iframe { filter: invert(1) hue-rotate(180deg) !important; }
            #${IDS.THEME_PANEL}, #${IDS.ANCHOR_TOGGLE}, #${IDS.SCROLL_BTN}, #${IDS.ANCHOR_PANEL}, #${IDS.MODAL} { background: rgba(255,255,255,0.95) !important; box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important; border: 1px solid rgba(0,0,0,0.05) !important; }
            #${IDS.MODAL} input { color: #000 !important; background: #f0f0f0 !important; }
        `,
        eyeCare: `
            html { filter: sepia(0.1) brightness(1.03) contrast(1.03) saturate(0.9) !important; background: #fffff5 !important; }
            #${IDS.THEME_PANEL}, #${IDS.ANCHOR_TOGGLE}, #${IDS.SCROLL_BTN}, #${IDS.ANCHOR_PANEL}, #${IDS.MODAL} { filter: sepia(0) !important; background: rgba(255,252,245,0.95) !important; border: 1px solid #e0e0d0 !important; }
            div[data-active="true"] { background: #f0f4db !important; color: #556b2f !important; }
        `,
        // 界面美化
        common: `
            /* 面板美化 */
            #${IDS.ANCHOR_PANEL} {
                font-family: 'Google Sans', 'Segoe UI', system-ui, sans-serif !important;
                border: 1px solid rgba(0,0,0,0.08) !important;
                backdrop-filter: blur(12px) !important;
                background: rgba(255, 255, 255, 0.9) !important;
                box-shadow: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.05) !important;
                border-radius: 20px !important;
            }
            #gemini-anchor-header {
                font-size: 14px !important;
                letter-spacing: 0.3px !important;
                color: #1f1f1f !important;
                border-bottom: 1px solid rgba(0,0,0,0.05) !important;
            }
            #gemini-anchor-list::-webkit-scrollbar {
                width: 4px;
            }
            #gemini-anchor-list::-webkit-scrollbar-thumb {
                background: #e0e0e0;
                border-radius: 4px;
            }
            #gemini-anchor-list li {
                margin-bottom: 2px !important;
                border-radius: 12px !important;
                transition: background-color 0.15s ease !important;
                border: 1px solid transparent !important;
                padding: 2px 4px !important;
            }
            #gemini-anchor-list li:hover {
                background-color: rgba(31, 31, 31, 0.05) !important;
            }
            #gemini-anchor-list li span {
                font-size: 13px !important;
                color: #444746 !important;
                font-weight: 500 !important;
            }

            /* 悬浮球 (Toggle) 状态优化 */
            #${IDS.ANCHOR_TOGGLE} {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }
            /* 有数据时的状态 */
            #${IDS.ANCHOR_TOGGLE}.has-anchors {
                background-color: #d3e3fd !important; /* 浅蓝背景 */
                box-shadow: 0 4px 12px rgba(11, 87, 208, 0.25) !important;
                color: #0b57d0 !important;
            }
            #${IDS.ANCHOR_TOGGLE}.has-anchors .toggle-icon {
                color: #0b57d0 !important;
                transform: scale(1.05);
            }
            /* 无数据时的状态 */
            #${IDS.ANCHOR_TOGGLE}.empty {
                background-color: rgba(255, 255, 255, 0.8) !important;
                color: #747775 !important;
                box-shadow: 0 2px 6px rgba(0,0,0,0.1) !important;
            }
            #${IDS.ANCHOR_TOGGLE}.empty .toggle-icon {
                opacity: 0.7;
            }

            /* 按钮样式微调 (32x32 紧凑) */
            .gemini-anchor-wrapper {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                height: 32px !important;
                width: 32px !important;
                margin-right: 6px !important;
            }
            .gemini-anchor-btn-native {
                background-color: transparent !important;
                color: #5f6368 !important;
                border: none !important;
                border-radius: 50% !important;
                cursor: pointer !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 32px !important;
                height: 32px !important;
                padding: 0 !important;
                margin: 0 !important;
                flex: 0 0 auto !important;
                transition: background-color 0.2s, color 0.2s !important;
            }
            .gemini-anchor-btn-native:hover {
                background-color: rgba(60,64,67,.08) !important;
                color: #1f1f1f !important;
            }
            .gemini-anchor-btn-native.active {
                color: #0b57d0 !important;
            }
            .gemini-anchor-btn-native > div {
                pointer-events: none !important;
            }
            .gemini-empty-tip {
                padding: 40px 20px !important;
                text-align: center;
                color: #8e918f !important;
                font-size: 13px;
            }
        `
    };

    const el = (tag, styles = {}, parent = null) => {
        const node = document.createElement(tag);
        Object.assign(node.style, styles);
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

            const overlay = el('div', {
                position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
                background: 'rgba(0,0,0,0.25)', zIndex: '2147483648', display: 'flex',
                alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
            }, document.body);
            overlay.id = IDS.MODAL + '-overlay';
            overlay.onclick = (e) => { if(e.target === overlay) this._close(overlay); };

            const box = el('div', {
                background: '#fff', padding: '24px', borderRadius: '24px', width: '320px',
                boxShadow: '0 16px 48px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '20px',
                transform: 'scale(0.95)', transition: 'transform 0.2s', opacity: '0', animation: 'geminiFadeIn 0.2s forwards'
            }, overlay);

            const animStyle = el('style', {}, box);
            animStyle.textContent = `@keyframes geminiFadeIn { to { transform: scale(1); opacity: 1; } }`;

            box.id = IDS.MODAL;
            el('div', { fontSize: '18px', fontWeight: '500', color: '#1f1f1f', textAlign: 'center' }, box).textContent = title;

            return { overlay, box };
        },
        _close(overlay) { overlay.remove(); },

        show(title, defaultValue, callback) {
            const { overlay, box } = this._createBase(title);

            const input = el('input', {
                padding: '12px 16px', borderRadius: '12px', border: '1px solid #e0e0e0', fontSize: '15px', outline: 'none', width: '100%', boxSizing: 'border-box',
                background: '#f8f9fa', transition: 'all 0.2s'
            }, box);
            input.onfocus = () => { input.style.background = '#fff'; input.style.borderColor = '#0b57d0'; };
            input.onblur = () => { input.style.background = '#f8f9fa'; input.style.borderColor = '#e0e0e0'; };
            input.value = defaultValue || '';

            const btnGroup = el('div', { display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '4px' }, box);
            const cancel = this._createBtn(btnGroup, '取消', '#5f6368', '#f1f3f4', () => this._close(overlay));
            const ok = this._createBtn(btnGroup, '确定', '#fff', '#0b57d0', () => {
                const val = input.value.trim();
                if (val) { callback(val); this._close(overlay); }
            });

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
        setTheme(key) {
            localStorage.setItem('gemini-theme', key);
            this.applyTheme(key);
        },
        applyTheme(key) {
            const css = CSS_RULES['common'] + (CSS_RULES[key] || '');
            setStyle(css, IDS.STYLE);
        },
        updateWide(enable) {
            let style = document.getElementById('gemini-wide-css');
            if (enable) {
                if (!style) {
                    style = el('style');
                    style.id = 'gemini-wide-css';
                    style.textContent = `
                        mat-sidenav-content, .main-content, .conversation-container,
                        [class*="conversation-container"], [class*="main-content"] {
                            max-width: 1800px !important;
                        }
                        .conversation-container { margin: 0 auto !important; }
                    `;
                    document.head.appendChild(style);
                }
            } else if (style) {
                style.remove();
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
            this.updateToggleVisuals(); // 初始化视觉状态
        },
        initGlobalClick() {
            document.addEventListener('click', (e) => {
                const panel = document.getElementById(IDS.ANCHOR_PANEL);
                const toggle = document.getElementById(IDS.ANCHOR_TOGGLE);
                if (panel && panel.style.visibility === 'visible' &&
                    !panel.contains(e.target) &&
                    !toggle.contains(e.target)) {
                    this.togglePanel();
                }
            });
        },
        save() {
            localStorage.setItem('gemini-anchors', JSON.stringify(this.data));
            const panel = document.getElementById(IDS.ANCHOR_PANEL);
            if (panel && panel.style.visibility === 'visible') {
                this.renderPanelList();
            }
            this.updateToggleVisuals(); // 保存时更新视觉
        },
        getCurrentKey() { return window.location.pathname; },
        getScroller() {
            return document.querySelector('infinite-scroller[data-test-id="chat-history-container"]') ||
                   document.querySelector('main infinite-scroller') ||
                   document.body;
        },
        // 更新悬浮球的视觉状态（有数据/无数据）- 去除数字角标
        updateToggleVisuals() {
            const btn = document.getElementById(IDS.ANCHOR_TOGGLE);
            if (!btn) return;

            const currentKey = this.getCurrentKey();
            const count = (this.data[currentKey] || []).length;

            if (count > 0) {
                btn.classList.add('has-anchors');
                btn.classList.remove('empty');
            } else {
                btn.classList.add('empty');
                btn.classList.remove('has-anchors');
            }
        },
        renderToggle() {
            if (document.getElementById(IDS.ANCHOR_TOGGLE)) return;
            const btn = el('div', {
                position: 'fixed', top: '50%', right: '20px',
                width: '40px', height: '40px', borderRadius: '50%', // 稍微加大点击区域
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                zIndex: '9999', transform: 'translateY(calc(-50% - 50px))'
            }, document.body);
            btn.id = IDS.ANCHOR_TOGGLE;
            btn.title = "跳转到指定回答";

            const icon = el('div', {
                className: 'toggle-icon', // 用于CSS动画
                width: '24px', height: '24px', backgroundColor: 'currentColor',
                webkitMaskImage: `url('${ICONS.pinFilled}')`, maskImage: `url('${ICONS.pinFilled}')`,
                webkitMaskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
                transition: 'transform 0.2s'
            }, btn);

            btn.onclick = (e) => { e.stopPropagation(); this.togglePanel(); };

            // 初始化状态
            this.updateToggleVisuals();
        },
        togglePanel() {
            let panel = document.getElementById(IDS.ANCHOR_PANEL);
            if (!panel) {
                panel = el('div', {
                    position: 'fixed', top: '50%', right: '80px', transform: 'translateY(calc(-50% - 50px))',
                    width: '260px', maxHeight: '70vh',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    zIndex: '9998', opacity: '0', visibility: 'hidden',
                    transition: 'opacity 0.2s ease, visibility 0.2s'
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
            // 展开时稍微变暗一点
            if(toggleBtn) toggleBtn.style.filter = isVisible ? 'brightness(0.9)' : 'brightness(1)';

            if (!isVisible) this.renderPanelList();
        },
        renderPanelList() {
            const list = document.getElementById('gemini-anchor-list');
            if (!list) return;
            while (list.firstChild) list.removeChild(list.firstChild);

            const anchors = this.data[this.getCurrentKey()] || [];
            if (anchors.length === 0) {
                const emptyTip = el('li');
                emptyTip.className = 'gemini-empty-tip';
                emptyTip.textContent = '暂无标记的回答';
                list.appendChild(emptyTip);
                return;
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
                el('div', {
                    width: '16px', height: '16px', backgroundColor: 'currentColor',
                    webkitMaskImage: `url('${ICONS.edit}')`, maskImage: `url('${ICONS.edit}')`,
                    webkitMaskSize: 'contain', maskRepeat: 'no-repeat'
                }, editBtn);

                editBtn.onmouseover = () => { editBtn.style.backgroundColor = 'rgba(0,0,0,0.05)'; editBtn.style.color = '#0b57d0'; };
                editBtn.onmouseout = () => { editBtn.style.backgroundColor = 'transparent'; editBtn.style.color = '#5f6368'; };

                editBtn.onclick = (e) => {
                    e.stopPropagation();
                    ModalManager.show('重命名回答', anchor.name, (newName) => {
                        this.data[this.getCurrentKey()][index].name = newName;
                        this.save();
                        this.renderPanelList();
                    });
                };

                const delBtn = el('div', { width: '28px', height: '28px', cursor: 'pointer', color: '#5f6368', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'background 0.2s' }, actionDiv);
                el('div', {
                    width: '16px', height: '16px', backgroundColor: 'currentColor',
                    webkitMaskImage: `url('${ICONS.deleteReal}')`, maskImage: `url('${ICONS.deleteReal}')`,
                    webkitMaskSize: 'contain', maskRepeat: 'no-repeat'
                }, delBtn);

                delBtn.onmouseover = () => { delBtn.style.backgroundColor = '#fce8e6'; delBtn.style.color = '#d93025'; };
                delBtn.onmouseout = () => { delBtn.style.backgroundColor = 'transparent'; delBtn.style.color = '#5f6368'; };

                delBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.data[this.getCurrentKey()].splice(index, 1);
                    this.save();
                    this.renderPanelList();
                    const el = document.getElementById(anchor.id);
                    if(el) {
                        const btn = el.querySelector('.gemini-anchor-btn-native');
                        if(btn) this.updateInlineBtnState(btn, false);
                    }
                };
            });
        },
        renderScrollBtn() {
            if (document.getElementById(IDS.SCROLL_BTN)) return;
            const btn = el('div', {
                position: 'fixed', bottom: '30px', right: '20px',
                width: '48px', height: '48px', borderRadius: '50%',
                background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                zIndex: '9997', transition: 'box-shadow 0.2s', border: '1px solid #dadce0'
            }, document.body);
            btn.id = IDS.SCROLL_BTN;
            btn.title = "滚动到底部";
            el('div', {
                width: '24px', height: '24px', backgroundColor: '#1f6fea',
                webkitMaskImage: `url('${ICONS.arrowDown}')`, maskImage: `url('${ICONS.arrowDown}')`,
                webkitMaskSize: 'cover', maskSize: 'cover'
            }, btn);
            btn.onmouseover = () => btn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            btn.onmouseout = () => btn.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.2)';
            btn.onclick = () => {
                const scroller = this.getScroller();
                if(scroller) scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' });
            };
        },

        injectBtn(node, actionBar) {
            if (actionBar.querySelector('.gemini-anchor-wrapper') || node.querySelector('.gemini-anchor-wrapper')) return;

            const wrapper = el('div', { className: 'gemini-anchor-wrapper' });
            wrapper.className = 'gemini-anchor-wrapper';

            const btn = document.createElement('button');
            btn.className = 'gemini-anchor-btn-native';
            btn.setAttribute('aria-label', '标记此回答');
            el('div', {
                width: '18px', height: '18px', backgroundColor: 'currentColor',
                // 默认状态（未标记）：使用实心图钉 (Filled)
                webkitMaskImage: `url('${ICONS.pinFilled}')`, maskImage: `url('${ICONS.pinFilled}')`,
                webkitMaskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center'
            }, btn);
            wrapper.appendChild(btn);

            const isAdded = (this.data[this.getCurrentKey()] || []).some(a => a.id === node.id);
            this.updateInlineBtnState(btn, isAdded);
            btn.onclick = (e) => {
                e.stopPropagation();
                e.preventDefault();

                if(!node.id) node.id = `gen-anchor-${Math.random().toString(36).substr(2, 9)}`;
                const currentAnchors = this.data[this.getCurrentKey()] || [];
                const existingIndex = currentAnchors.findIndex(a => a.id === node.id);
                if (existingIndex !== -1) {
                    ModalManager.confirm('移除标记', '是否取消标记此回答？', () => {
                        currentAnchors.splice(existingIndex, 1);
                        this.data[this.getCurrentKey()] = currentAnchors;
                        this.save();
                        this.updateInlineBtnState(btn, false);
                    });
                } else {
                    ModalManager.show('标记回答', `回答 ${currentAnchors.length + 1}`, (name) => {
                        if (!this.data[this.getCurrentKey()]) this.data[this.getCurrentKey()] = [];
                        this.data[this.getCurrentKey()].push({ id: node.id, name });
                        this.save();
                        this.updateInlineBtnState(btn, true);
                    });
                }
            };

            let targetContainer = node.querySelector('.buttons-container-v2');

            if (!targetContainer) {
                const knownBtn = node.querySelector('thumb-up-button, copy-button, [data-test-id="more-menu-button"]');
                if (knownBtn) {
                    targetContainer = knownBtn.closest('.buttons-container-v2') || knownBtn.closest('.actions-container-v2');
                }
            }

            if (targetContainer) {
                if (!targetContainer.querySelector('.gemini-anchor-wrapper')) {
                    targetContainer.insertBefore(wrapper, targetContainer.firstChild);
                }
            } else {
                actionBar.appendChild(wrapper);
            }
        },

        updateInlineBtnState(btn, active) {
            const icon = btn.firstChild;
            if (active) {
                // 1. 已标记状态：对换为描边图钉 (Outline)
                icon.style.webkitMaskImage = `url('${ICONS.pinOutline}')`;
                icon.style.maskImage = `url('${ICONS.pinOutline}')`;
                btn.classList.add('active');
                btn.title = "已标记 (点击移除)";
            } else {
                // 1. 未标记状态：对换为实心图钉 (Filled)
                icon.style.webkitMaskImage = `url('${ICONS.pinFilled}')`;
                icon.style.maskImage = `url('${ICONS.pinFilled}')`;
                btn.classList.remove('active');
                btn.title = "标记此回答";
            }
        },
        refreshAllInlineButtons() {
            document.querySelectorAll('.gemini-anchor-btn-native').forEach(btn => {
                 const parent = btn.closest('model-response');
                 if(parent) {
                     const isAdded = (this.data[this.getCurrentKey()] || []).some(a => a.id === parent.id);
                     this.updateInlineBtnState(btn, isAdded);
                 }
            });
        },
        assignId(node) {
            if (node.id) return;
            const content = node.querySelector('[id^="message-content-"]');
            if (content && content.id) {
                node.id = content.id.replace('message-content-', 'model-resp-');
            }
        },
        robustInject(node) {
            if (!node || node.dataset.anchorPolling) return;
            node.dataset.anchorPolling = 'true';
            this.assignId(node);

            const findContainer = () => node.querySelector('.buttons-container-v2, .actions-container-v2, .buttons-container');

            if (!node.id || !findContainer()) {
                let attempts = 0;
                const interval = setInterval(() => {
                    attempts++;
                    this.assignId(node);
                    const actionBar = findContainer();
                    if (node.id && actionBar) {
                        clearInterval(interval);
                        this.injectBtn(node, actionBar);
                        delete node.dataset.anchorPolling;
                    } else if (attempts > 50) {
                        clearInterval(interval);
                        delete node.dataset.anchorPolling;
                    }
                }, 200);
            } else {
                const actionBar = findContainer();
                this.injectBtn(node, actionBar);
                delete node.dataset.anchorPolling;
            }
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
                    if (m.target && (m.target.classList?.contains('buttons-container-v2') || m.target.tagName === 'MESSAGE-ACTIONS')) {
                        const modelResp = m.target.closest('model-response');
                        if (modelResp) processed.add(modelResp);
                    }
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
                    setTimeout(() => {
                        this.renderPanelList();
                        this.updateToggleVisuals(); // 换页更新
                        document.querySelectorAll('model-response').forEach(el => this.robustInject(el));
                    }, 500);
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
                if (!role && n.closest) {
                    const pUser = n.closest('[data-test-id="user-query"], .user-query');
                    const pGemini = n.closest('[data-test-id="model-response"], .model-response');
                    if (pUser) role = 'User'; else if (pGemini) role = 'Gemini';
                }
                if (role === 'User') md += `### User\n`;
                else if (role === 'Gemini') md += `### Gemini\n`;
                md += `${text}\n\n---\n\n`;
                last = text;
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
                position: 'fixed', bottom: '120px', right: '24px', display: 'flex', flexDirection: 'column', gap: '8px',
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
            const btn = el('div', {
                width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#5f6368', transition: 'transform 0.2s, background 0.2s'
            }, panel);
            btn.title = title;
            btn.dataset.mode = key;
            btn.dataset.type = type;
            el('div', {
                width: '14px', height: '14px', backgroundColor: 'currentColor', pointerEvents: 'none',
                webkitMaskImage: `url('${ICONS[key]}')`, maskImage: `url('${ICONS[key]}')`,
                webkitMaskSize: 'cover', maskSize: 'cover'
            }, btn);
            btn.onmouseover = () => { if(btn.dataset.active !== 'true') { btn.style.background = 'rgba(0,0,0,0.05)'; btn.style.transform = 'scale(1.1)'; }};
            btn.onmouseout = () => { if(btn.dataset.active !== 'true') { btn.style.background = 'transparent'; btn.style.transform = 'scale(1)'; }};
            btn.onclick = (e) => {
                e.stopPropagation();
                if (type === 'action') return ExportManager.doExport();
                if (type === 'toggle') {
                    const newState = !(localStorage.getItem(`gemini-${key}`) === 'true');
                    localStorage.setItem(`gemini-${key}`, newState);
                    ThemeManager.updateWide(newState);
                } else {
                    ThemeManager.setTheme(key);
                }
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
        ['gemini-theme-panel', 'gemini-panel-lite'].forEach(id => {
            const old = document.getElementById(id);
            if(old) old.remove();
        });
        ThemeManager.init();
        MainPanel.init();
        AnchorManager.init();
        new MutationObserver(() => {
            if (!document.getElementById(IDS.THEME_PANEL)) MainPanel.init();
            if (!document.getElementById(IDS.ANCHOR_TOGGLE)) AnchorManager.renderToggle();
        }).observe(document.body, { childList: true, subtree: true });
    };
    setTimeout(start, 500);
})();