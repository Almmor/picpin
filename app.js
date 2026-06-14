(function () {
    'use strict';

    // ========== 常量与配置 ==========
    const CONFIG_PATH = './app.json';
    const VALID_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'];

    // 兼容窗口环境 API（Electron / 桌面挂件运行时）
    const windowRuntime = {
        setAlwaysOnTop: function (flag) {
            const api = window.fm || window.kt;
            if (api && api.window && api.window.setAlwaysOnTop) {
                api.window.setAlwaysOnTop({ isAlwaysOnTop: flag });
                return true;
            }
            return false;
        },
        close: function () {
            const api = window.fm || window.kt;
            if (api && api.window && api.window.close) {
                api.window.close();
                return true;
            }
            window.close();
            return true;
        },
        show: function () {
            const api = window.fm || window.kt;
            if (api && api.window && api.window.show) {
                api.window.show().catch(function () {});
            }
        }
    };

    // ========== 运行时状态 ==========
    const state = {
        images: [],
        currentIndex: 0,
        mode: 'slide',
        autoPlay: false,
        intervalMs: 3000,
        imageFit: 'contain',
        isPinned: false,
        timer: null,
        config: null
    };

    // ========== DOM 引用 ==========
    const dom = {
        mainImage: document.getElementById('mainImage'),
        prevBtn: document.getElementById('prevBtn'),
        nextBtn: document.getElementById('nextBtn'),
        counter: document.getElementById('counter'),
        playBtn: document.getElementById('playBtn'),
        modeBtn: document.getElementById('modeBtn'),
        intervalSelect: document.getElementById('intervalSelect'),
        fitSelect: document.getElementById('fitSelect'),
        imageContainer: document.getElementById('imageContainer'),
        gridContainer: document.getElementById('gridContainer'),
        gridList: document.getElementById('gridList'),
        emptyState: document.getElementById('emptyState'),
        dropZone: document.getElementById('dropZone'),
        viewerArea: document.getElementById('viewerArea'),
        pinBtn: document.getElementById('pinBtn'),
        closeBtn: document.getElementById('closeBtn'),
        app: document.getElementById('app')
    };

    // ========== 工具函数 ==========
    function isValidImageFile(filename) {
        if (!filename) return false;
        const parts = String(filename).split('.');
        if (parts.length < 2) return false;
        const ext = parts[parts.length - 1].toLowerCase();
        return VALID_EXTENSIONS.indexOf(ext) >= 0;
    }

    function resolveImagePath(path) {
        if (!path) return '';
        if (/^(https?:)?\/\//.test(path)) return path;
        if (path.startsWith('data:')) return path;
        if (path.startsWith('./') || path.startsWith('/')) return path;
        return './' + path;
    }

    function showElement(el) { if (el) el.classList.remove('hidden'); }
    function hideElement(el) { if (el) el.classList.add('hidden'); }

    // ========== 视图渲染 ==========
    function updateViewState() {
        const hasImages = state.images.length > 0;
        if (hasImages) {
            hideElement(dom.emptyState);
            if (state.mode === 'slide') {
                showElement(dom.imageContainer);
                hideElement(dom.gridContainer);
            } else {
                hideElement(dom.imageContainer);
                showElement(dom.gridContainer);
            }
        } else {
            showElement(dom.emptyState);
            hideElement(dom.imageContainer);
            hideElement(dom.gridContainer);
        }
    }

    function renderCurrentImage() {
        if (state.images.length === 0) {
            dom.counter.textContent = '0 / 0';
            dom.mainImage.src = '';
            updateViewState();
            return;
        }
        if (state.currentIndex < 0) state.currentIndex = state.images.length - 1;
        if (state.currentIndex >= state.images.length) state.currentIndex = 0;

        const src = resolveImagePath(state.images[state.currentIndex]);
        dom.mainImage.src = src;
        dom.mainImage.style.objectFit = state.imageFit;
        dom.counter.textContent = (state.currentIndex + 1) + ' / ' + state.images.length;
        updateViewState();
    }

    function renderGridView() {
        dom.gridList.innerHTML = '';
        state.images.forEach(function (imgPath, idx) {
            const item = document.createElement('div');
            item.className = 'grid-item' + (idx === state.currentIndex ? ' active' : '');
            item.title = '图片 ' + (idx + 1);

            const img = document.createElement('img');
            img.src = resolveImagePath(imgPath);
            img.alt = '图片-' + (idx + 1);
            item.appendChild(img);

            item.addEventListener('click', function () {
                state.currentIndex = idx;
                renderCurrentImage();
                renderGridView();
            });

            dom.gridList.appendChild(item);
        });
    }

    // ========== 播放与导航 ==========
    function nextImage() {
        if (state.images.length === 0) return;
        state.currentIndex++;
        renderCurrentImage();
        if (state.mode === 'grid') renderGridView();
    }

    function prevImage() {
        if (state.images.length === 0) return;
        state.currentIndex--;
        renderCurrentImage();
        if (state.mode === 'grid') renderGridView();
    }

    function startAutoPlay() {
        stopAutoPlay();
        if (!state.autoPlay) return;
        if (state.images.length < 2) return;
        state.timer = setInterval(nextImage, state.intervalMs);
    }

    function stopAutoPlay() {
        if (state.timer) {
            clearInterval(state.timer);
            state.timer = null;
        }
    }

    function toggleAutoPlay() {
        state.autoPlay = !state.autoPlay;
        if (state.autoPlay) {
            dom.playBtn.textContent = '⏸ 暂停';
            dom.playBtn.classList.add('active');
            startAutoPlay();
        } else {
            dom.playBtn.textContent = '▶ 播放';
            dom.playBtn.classList.remove('active');
            stopAutoPlay();
        }
    }

    function toggleViewMode() {
        if (state.mode === 'slide') {
            state.mode = 'grid';
            dom.modeBtn.textContent = '轮播';
            renderGridView();
        } else {
            state.mode = 'slide';
            dom.modeBtn.textContent = '网格';
        }
        updateViewState();
    }

    function togglePin() {
        state.isPinned = !state.isPinned;
        const ok = windowRuntime.setAlwaysOnTop(state.isPinned);
        if (!ok && state.isPinned) {
            // 在纯浏览器环境中提示一下
            console.log('当前环境不支持窗口置顶');
        }
        if (state.isPinned) {
            dom.pinBtn.textContent = '📍';
            dom.pinBtn.classList.add('active');
        } else {
            dom.pinBtn.textContent = '📌';
            dom.pinBtn.classList.remove('active');
        }
    }

    function closeApp() {
        windowRuntime.close();
    }

    // ========== 拖拽添加图片 ==========
    function addDroppedFiles(files) {
        if (!files || files.length === 0) return;
        let loaded = 0;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const isImageType = file.type && file.type.indexOf('image/') === 0;
            const isValidExt = isValidImageFile(file.name);
            if (!isImageType && !isValidExt) continue;

            try {
                const reader = new FileReader();
                reader.onload = function (e) {
                    state.images.push(e.target.result);
                    loaded++;
                    if (state.images.length === 1) state.currentIndex = 0;
                    renderCurrentImage();
                    if (state.mode === 'grid') renderGridView();
                    if (state.autoPlay) startAutoPlay();
                };
                reader.readAsDataURL(file);
            } catch (err) {
                console.warn('读取图片失败:', file.name, err);
            }
        }
    }

    // ========== 事件绑定 ==========
    function bindEvents() {
        dom.prevBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            prevImage();
        });
        dom.nextBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            nextImage();
        });
        dom.mainImage.addEventListener('click', nextImage);
        dom.playBtn.addEventListener('click', toggleAutoPlay);
        dom.modeBtn.addEventListener('click', toggleViewMode);
        dom.pinBtn.addEventListener('click', togglePin);
        dom.closeBtn.addEventListener('click', closeApp);

        dom.intervalSelect.addEventListener('change', function (e) {
            state.intervalMs = parseInt(e.target.value, 10) || 3000;
            if (state.autoPlay) startAutoPlay();
        });

        dom.fitSelect.addEventListener('change', function (e) {
            state.imageFit = e.target.value;
            dom.mainImage.style.objectFit = state.imageFit;
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight') nextImage();
            else if (e.key === 'ArrowLeft') prevImage();
            else if (e.key === 'Escape') closeApp();
            else if (e.key === ' ') {
                e.preventDefault();
                toggleAutoPlay();
            }
        });

        // 拖拽事件
        dom.app.addEventListener('dragenter', function (e) {
            e.preventDefault();
            e.stopPropagation();
            showElement(dom.dropZone);
        });

        dom.app.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.stopPropagation();
            showElement(dom.dropZone);
        });

        dom.app.addEventListener('dragleave', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (e.target === dom.app || e.relatedTarget === null) {
                hideElement(dom.dropZone);
            }
        });

        dom.app.addEventListener('drop', function (e) {
            e.preventDefault();
            e.stopPropagation();
            hideElement(dom.dropZone);
            if (e.dataTransfer && e.dataTransfer.files) {
                addDroppedFiles(e.dataTransfer.files);
            }
        });
    }

    // ========== 主题与配置应用 ==========
    function applyTheme(cfg) {
        if (!cfg || !cfg.theme) return;
        const root = document.documentElement;
        const t = cfg.theme;
        if (t.primaryColor) root.style.setProperty('--theme-primary', t.primaryColor);
        if (t.secondaryColor) root.style.setProperty('--theme-secondary', t.secondaryColor);
        if (t.backgroundColor) root.style.setProperty('--theme-bg', t.backgroundColor);
        if (t.textColor) root.style.setProperty('--theme-text', t.textColor);
        if (t.accentColor) root.style.setProperty('--theme-accent', t.accentColor);
    }

    function applyViewerDefaults(cfg) {
        if (!cfg) return;
        const v = cfg.viewer || {};
        state.mode = v.mode || 'slide';
        state.autoPlay = v.autoPlay === true;
        state.intervalMs = v.intervalMs || 3000;
        state.imageFit = v.imageFit || 'contain';
    }

    function syncUIFromState() {
        dom.intervalSelect.value = String(state.intervalMs);
        dom.fitSelect.value = state.imageFit;
        if (state.autoPlay) {
            dom.playBtn.textContent = '⏸ 暂停';
            dom.playBtn.classList.add('active');
        }
        if (state.mode === 'grid') {
            dom.modeBtn.textContent = '轮播';
        }
    }

    // ========== 启动流程 ==========
    function loadConfigAndInit() {
        fetch(CONFIG_PATH)
            .then(function (response) {
                if (!response.ok) throw new Error('配置文件读取失败');
                return response.json();
            })
            .then(function (cfg) {
                state.config = cfg;
                applyTheme(cfg);
                applyViewerDefaults(cfg);
                if (Array.isArray(cfg.images)) {
                    state.images = cfg.images.slice();
                }
                syncUIFromState();
                finishInit();
            })
            .catch(function (err) {
                console.warn('无法加载 app.json，使用默认配置启动:', err.message);
                state.images = [];
                syncUIFromState();
                finishInit();
            });
    }

    function finishInit() {
        renderCurrentImage();
        if (state.mode === 'grid') renderGridView();
        if (state.autoPlay) startAutoPlay();
        bindEvents();
        windowRuntime.show();
    }

    function init() {
        loadConfigAndInit();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
