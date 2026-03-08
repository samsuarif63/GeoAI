document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi Peta
    const map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView([-5.1476, 119.4327], 13);

    // Marker Definitions
    const markerIcons = {
        'Circle': `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><circle cx="12" cy="12" r="8"/></svg>`,
        'Square': `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><rect x="6" y="6" width="12" height="12"/></svg>`,
        'Triangle': `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 4L4 20h16L12 4z"/></svg>`,
        'Star': `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"/></svg>`,
        'Pin': `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`
    };

    const getMarkerIcon = (type, color, size = 24) => {
        const svg = markerIcons[type] || markerIcons['Circle'];
        // Replace hardcoded dimensions with 100% to fill container
        const scaledSvg = svg.replace(/width="24" height="24"/, 'width="100%" height="100%"');

        return L.divIcon({
            className: 'custom-marker-icon',
            html: `<div style="color: ${color}; width: ${size}px; height: ${size}px; filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.5)); display: flex; align-items: center; justify-content: center;">${scaledSvg}</div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
            popupAnchor: [0, -size / 2]
        });
    };

    // Definisi Basemaps
    const basemaps = {
        'dark': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 20
        }),
        'streets': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
        }),
        'satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri'
        })
    };

    // Tambahkan Default Basemap
    let currentBasemap = basemaps['satellite'].addTo(map);

    // 1. Tambahkan Skala Dinamis (Control Scale)
    L.control.scale({
        metric: true,
        imperial: false,
        position: 'bottomleft'
    }).addTo(map);

    // 2. Inisialisasi Inset Map
    const insetMap = L.map('inset-map', {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        touchZoom: false,
        doubleClickZoom: false,
        boxZoom: false
    }).setView(map.getCenter(), 7); // Level Pulau

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd'
    }).addTo(insetMap);

    // Indikator Bounding Box di Inset Map
    let insetRect = L.rectangle(map.getBounds(), {
        color: 'var(--accent-amber)',
        weight: 1,
        fillOpacity: 0.1
    }).addTo(insetMap);

    // Fungsi Sinkronisasi Peta Utama -> Inset
    const syncMaps = () => {
        // Fokus pada level pulau (zoom 6-9)
        let insetZoom = Math.min(9, Math.max(6, map.getZoom() - 7));
        insetMap.setView(map.getCenter(), insetZoom);
        insetRect.setBounds(map.getBounds());
    };

    map.on('move', syncMaps);
    map.on('zoomend', syncMaps);

    // Toggle Basemap Selector Menu
    const btnBasemap = document.getElementById('btn-basemap');
    const basemapPanel = document.getElementById('basemap-selector');

    btnBasemap.addEventListener('click', (e) => {
        e.stopPropagation();
        basemapPanel.style.display = basemapPanel.style.display === 'none' ? 'flex' : 'none';
    });

    // Sembunyikan panel saat klik di luar
    document.addEventListener('click', () => {
        basemapPanel.style.display = 'none';
    });

    basemapPanel.addEventListener('click', (e) => e.stopPropagation());

    // Switch Basemap Logic
    document.querySelectorAll('.basemap-option').forEach(option => {
        option.addEventListener('click', function () {
            const selected = this.getAttribute('data-basemap');

            // Hapus layer lama
            map.removeLayer(currentBasemap);

            // Tambahkan layer baru
            currentBasemap = basemaps[selected].addTo(map);

            // Update UI
            document.querySelectorAll('.basemap-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');

            basemapPanel.style.display = 'none';
        });
    });


    // Event listeners untuk kontrol navigasi kustom
    document.getElementById('btn-zoom-in').addEventListener('click', () => map.zoomIn());
    document.getElementById('btn-zoom-out').addEventListener('click', () => map.zoomOut());
    document.getElementById('btn-recenter').addEventListener('click', () => {
        map.setView([-5.1476, 119.4327], 13);
    });


    // Update display koordinat saat mouse bergerak di peta
    map.on('mousemove', (e) => {
        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);
        const zoom = map.getZoom().toFixed(1);

        document.getElementById('coords-display').innerHTML = `
            LAT: ${lat}° | LON: ${lng}° | ZOOM: ${zoom}x | <span style="color: #4ade80;">● Cursor Tracking</span>
        `;
    });

    // Tetap update saat zoom berubah (meskipun mouse tidak bergerak)
    map.on('zoomend', () => {
        const center = map.getCenter();
        const lat = center.lat.toFixed(6);
        const lng = center.lng.toFixed(6);
        const zoom = map.getZoom().toFixed(1);
        document.getElementById('coords-display').innerHTML = `
            LAT: ${lat}° | LON: ${lng}° | ZOOM: ${zoom}x | <span style="color: #4ade80;">● Live Data</span>
        `;
    });

    // Helper: Deterministic Color from ID/String
    const getColorFromString = (str) => {
        let hash = 0;
        str = String(str);
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
            let value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    };

    // --- PERISTENCE HELPERS ---
    const STORAGE_KEY = 'active_layers';

    const saveLayerToStorage = (tableName, displayName, isVectorTile) => {
        if (!tableName) return;
        let layers = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        // Check if exists
        if (!layers.find(l => l.tableName === tableName)) {
            layers.push({ tableName, displayName, isVectorTile });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(layers));
        }
    };

    const removeLayerFromStorage = (tableName) => {
        if (!tableName) return;
        let layers = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        layers = layers.filter(l => l.tableName !== tableName);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(layers));
    };

    const loadPersistedLayers = async () => {
        const layers = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (layers.length === 0) return;

        // Tampilkan loading indicator sementara jika perlu, atau biarkan async
        console.log(`Loading ${layers.length} persisted layers...`);

        for (const layer of layers) {
            // Hindari duplikasi jika sudah ada (meskipun init harusnya kosong)
            if (document.getElementById('toc-layers').innerText.includes(layer.displayName)) continue;

            try {
                // If it's the RTRW layer, treat as vector tile
                if (layer.displayName.includes("RTRW") || layer.isVectorTile) {
                    addLayerToMap(null, layer.displayName, layer.tableName, true);
                } else {
                    const response = await fetch(`/api/layers/${layer.tableName}`);
                    if (!response.ok) continue;
                    const data = await response.json();
                    addLayerToMap(data, layer.displayName, layer.tableName, false);
                }
            } catch (e) {
                console.error(`Failed to restore layer ${layer.displayName}:`, e);
            }
        }
    };

    // Registry to keep track of active leaflet layers by their table name
    const activeLeafletLayers = {};

    // Fungsi Reusable untuk menambahkan Layer ke Peta dan ToC
    const addLayerToMap = (dataOrUrl, layerName, tableName = null, isVectorTile = false) => {
        // Save to storage for persistence on refresh (if it's not a dummy or system call)
        if (tableName) {
            saveLayerToStorage(tableName, layerName, isVectorTile);
        }
        const tocContainer = document.getElementById('toc-layers');
        let newLayer;

        // Initial Style State
        const layerStyle = {
            color: '#FFB800',
            weight: 2,
            markerType: 'Circle' // Default marker
        };

        // Detect Geometry Type (for GeoJSON)
        let isPointLayer = false;
        if (!isVectorTile && dataOrUrl && dataOrUrl.features && dataOrUrl.features.length > 0) {
            const type = dataOrUrl.features[0].geometry.type;
            isPointLayer = (type === 'Point' || type === 'MultiPoint');
        }

        if (isVectorTile && tableName) {
            // Gunakan VectorGrid untuk Data Database
            const url = `/api/tiles/${tableName}/{z}/{x}/{y}.pbf`;

            // Define styles for MVT
            const vectorTileOptions = {
                rendererFactory: L.canvas.tile,
                attribution: '© TerraGIS',
                vectorTileLayerStyles: {
                    [tableName]: function (properties, zoom) {
                        return {
                            weight: layerStyle.weight,
                            color: layerStyle.color,
                            fillColor: layerStyle.color,
                            fillOpacity: 0.3,
                            fill: true
                        };
                    }
                },
                interactive: true,
                getFeatureId: (f) => f.properties.gid || f.properties.id || 0,
                // maxNativeZoom: 14, // Tiles are generated up to this zoom
                minZoom: 0,        // Prevent loading too many tiles at low zoom
                maxZoom: 22        // Allow overzooming
            };

            newLayer = L.vectorGrid.protobuf(url, vectorTileOptions)
                .on('click', (e) => {
                    // VectorGrid click event structure is different
                    const props = e.layer.properties;
                    const modal = document.getElementById('info-modal');
                    const modalBody = document.getElementById('modal-body');

                    let propertiesHtml = '<div style="color: white; font-size: 13px; max-height: 300px; overflow-y: auto;">';
                    for (let key in props) {
                        if (key !== '_feature_id') {
                            propertiesHtml += `<p style="margin-bottom: 8px;"><strong style="color: #888;">${key}:</strong> ${props[key]}</p>`;
                        }
                    }
                    propertiesHtml += '</div>';

                    // Modal Title with Feature ID if available
                    const title = props.gid ? `Feature #${props.gid}` : 'Feature Details';
                    document.getElementById('modal-title').innerText = title;

                    modalBody.innerHTML = `
                    <h3 style="color: var(--accent-amber); margin-bottom: 15px;">DATA ATTRIBUTE</h3>
                    ${propertiesHtml}
                `;
                    modal.style.display = 'flex';
                });

        } else {
            // Gunakan GeoJSON Standar
            newLayer = L.geoJSON(dataOrUrl, {
                style: {
                    color: layerStyle.color,
                    weight: layerStyle.weight,
                    fillColor: 'rgba(255, 184, 0, 0.2)',
                    fillOpacity: 0.3
                },
                pointToLayer: (feature, latlng) => {
                    // Custom Marker for Points
                    if (isPointLayer) {
                        return L.marker(latlng, {
                            icon: getMarkerIcon(layerStyle.markerType, layerStyle.color)
                        });
                    }
                    return L.circleMarker(latlng); // Fallback
                },
                onEachFeature: (feature, layer) => {
                    layer.on('click', () => {
                        const modal = document.getElementById('info-modal');
                        const modalBody = document.getElementById('modal-body');

                        // Set Modal Title
                        document.getElementById('modal-title').innerText = 'Parcel Details';

                        let propertiesHtml = '<div style="color: white; font-size: 13px; max-height: 300px; overflow-y: auto;">';
                        for (let key in feature.properties) {
                            propertiesHtml += `<p style="margin-bottom: 8px;"><strong style="color: #888;">${key}:</strong> ${feature.properties[key]}</p>`;
                        }
                        propertiesHtml += '</div>';

                        modalBody.innerHTML = `
                            <h3 style="color: var(--accent-amber); margin-bottom: 15px;">DATA ATTRIBUTE</h3>
                            ${propertiesHtml}
                        `;
                        modal.style.display = 'flex';
                    });
                }
            });
        }

        // Add to map mostly for GeoJSON, VectorGrid adds itself but we need reference
        newLayer.addTo(map);

        // Register in our global tracking object
        if (tableName) {
            activeLeafletLayers[tableName] = newLayer;
        }

        // Tambahkan ke ToC
        if (tocContainer.innerText.includes("No thematic layers")) {
            tocContainer.innerHTML = '';
        }

        const layerCard = document.createElement('div');
        layerCard.className = 'layer-card active';
        // Store data for Attribute Table
        layerCard.layerData = dataOrUrl;
        layerCard.tableName = tableName;
        layerCard.isVectorTile = isVectorTile;

        // --- CATEGORIZED LEGEND LOGIC ---
        const getLayerAttributes = (layerData) => {
            if (!layerData) return [];
            // Handle GeoJSON
            if (layerData.features && layerData.features.length > 0) {
                const props = layerData.features[0].properties;
                return Object.keys(props).filter(key => key !== 'id' && key !== 'gid' && key !== 'objectid');
            }
            // Handle MVT? (Usually metadata is needed, but we might check if layerData is passed)
            // For now, support GeoJSON primarily as MVT attributes are harder to inspect without metadata endpoint
            return [];
        };

        const availableAttributes = getLayerAttributes(dataOrUrl);

        layerCard.innerHTML = `
            <div class="layer-header">
                <div style="display: flex; gap: 10px; align-items: center; overflow: hidden;">
                    <div class="layer-color-legend" style="width: 12px; height: 12px; background: ${layerStyle.color}; border-radius: 2px; flex-shrink: 0; transition: background 0.3s;"></div>
                    <span style="font-size: 12px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;" title="${layerName}">${layerName}</span>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 4px;" title="Stroke Width">
                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6L12 18"></path></svg>
                        <input type="range" class="layer-weight-slider" min="0.5" max="5" step="0.5" value="2" style="width: 50px; cursor: pointer;">
                    </div>
                    <button class="btn-legend-toggle" style="background: none; border: none; padding: 0; cursor: pointer; color: #aaa;" title="Style / Legend">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                        </svg>
                    </button>
                    ${isPointLayer ? `
                        <div class="marker-selector-container">
                            <button class="btn-marker-trigger" title="Select Marker">
                                <div style="width: 12px; height: 12px;">${markerIcons[layerStyle.markerType]}</div>
                            </button>
                            <div class="marker-dropdown">
                                ${Object.keys(markerIcons).map(key => `
                                    <div class="marker-option ${layerStyle.markerType === key ? 'selected' : ''}" data-type="${key}" title="${key}">
                                        <div style="width: 16px; height: 16px;">${markerIcons[key]}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <!-- Hidden Color Picker for internal logic -->
                        <input type="color" class="layer-color-picker" value="${layerStyle.color}" style="display:none;">
                    ` : `
                        <input type="color" class="layer-color-picker" value="${layerStyle.color}" style="width: 20px; height: 20px; border: none; padding: 0; background: none; cursor: pointer; visibility: hidden; position: absolute;">
                        <button class="btn-color-trigger" style="background: none; border: none; padding: 0; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="Change Color" onclick="this.previousElementSibling.click()">
                            <div style="width: 14px; height: 14px; border-radius: 50%; background: linear-gradient(135deg, ${layerStyle.color}, #FF8A00); border: 1px solid #555;"></div>
                        </button>
                        <button class="btn-random-color" style="background: none; border: none; padding: 0; cursor: pointer; color: #aaa;" title="Randomize Colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l-5 5M4 4l5 5"></path>
                            </svg>
                        </button>
                    `}
                    <div class="visibility-toggle" style="cursor: pointer; color: var(--accent-amber);">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </div>
                </div>
            </div>
            
            <!-- Legend Section -->
            <div class="layer-legend-section">
                <select class="attribute-select">
                    <option value="">-- Single Symbol --</option>
                    ${availableAttributes.map(attr => `<option value="${attr}">${attr}</option>`).join('')}
                </select>
                <div class="legend-container"></div>
            </div>
        `;

        const toggleBtn = layerCard.querySelector('.visibility-toggle');
        const colorInput = layerCard.querySelector('.layer-color-picker');
        const weightSlider = layerCard.querySelector('.layer-weight-slider');
        const colorTrigger = layerCard.querySelector('.btn-color-trigger div'); // Might be null for points
        const legendColor = layerCard.querySelector('.layer-color-legend');

        const legendToggleBtn = layerCard.querySelector('.btn-legend-toggle');
        const legendSection = layerCard.querySelector('.layer-legend-section');
        const attributeSelect = layerCard.querySelector('.attribute-select');
        const legendContainer = layerCard.querySelector('.legend-container');

        let isVisible = true;

        // Toggle Legend Panel
        legendToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            legendSection.classList.toggle('active');
        });

        // Function to update layer style
        const updateStyle = (color, weight = 2, markerType = null) => {
            // Update State
            layerStyle.color = color;
            layerStyle.weight = parseFloat(weight);
            if (markerType) layerStyle.markerType = markerType;

            // Calculate marker size based on weight (Base 12px * weight)
            // Weight ranges 0.5 to 5. Default 2 -> 24px.
            const markerSize = layerStyle.weight * 12;

            const newStyle = {
                color: layerStyle.color,
                fillColor: layerStyle.color,
                weight: layerStyle.weight,
                fillOpacity: 0.3,
                fill: true
            };

            // Update UI
            if (colorTrigger) colorTrigger.style.background = color;
            legendColor.style.background = color;

            // Update Layer
            if (isVectorTile) {
                if (newLayer.options.vectorTileLayerStyles && newLayer.options.vectorTileLayerStyles[tableName]) {
                    newLayer.options.vectorTileLayerStyles[tableName] = newStyle;
                    if (isVisible) {
                        newLayer.redraw ? newLayer.redraw() : (map.removeLayer(newLayer), map.addLayer(newLayer));
                    }
                }
            } else {
                // GeoJSON
                if (isPointLayer) {
                    newLayer.eachLayer(layer => {
                        if (layer.setIcon) {
                            layer.setIcon(getMarkerIcon(layerStyle.markerType, layerStyle.color, markerSize));
                        }
                    });
                } else {
                    if (newLayer.setStyle) {
                        newLayer.setStyle(newStyle);
                    }
                }
            }
        };

        // Event Listener for Marker Selector
        if (isPointLayer) {
            const trigger = layerCard.querySelector('.btn-marker-trigger');
            const dropdown = layerCard.querySelector('.marker-dropdown');
            const options = layerCard.querySelectorAll('.marker-option');

            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('active');
            });

            // Close on click outside
            document.addEventListener('click', (e) => {
                if (!layerCard.contains(e.target)) {
                    dropdown.classList.remove('active');
                }
            });

            options.forEach(opt => {
                opt.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const type = opt.getAttribute('data-type');

                    // Update Active UI
                    options.forEach(o => o.classList.remove('selected'));
                    opt.classList.add('selected');

                    // Update Trigger Icon
                    trigger.innerHTML = `<div style="width: 12px; height: 12px;">${markerIcons[type]}</div>`;

                    updateStyle(layerStyle.color, layerStyle.weight, type);
                    dropdown.classList.remove('active');
                });
            });
        }

        // Categorize Logic
        const classifyLayer = (attribute) => {
            if (!attribute) {
                // Revert to Single Symbol
                updateStyle(colorInput.value, weightSlider.value);
                legendContainer.innerHTML = '';
                return;
            }

            // 1. Scan for Unique Values
            const uniqueValues = new Set();
            if (dataOrUrl && dataOrUrl.features) {
                dataOrUrl.features.forEach(f => {
                    if (f.properties[attribute]) uniqueValues.add(f.properties[attribute]);
                });
            }

            // Limit unique values to prevent crash on ID columns
            if (uniqueValues.size > 100) {
                alert("Too many unique values (>100). Please select a categorical field.");
                attributeSelect.value = "";
                return;
            }

            // 2. Generate Color Map
            const colorMap = {};
            const sortedValues = Array.from(uniqueValues).sort();

            sortedValues.forEach((val, index) => {
                // Use HSL for distinct colors
                // const hue = (index * 137.508) % 360; // Golden angle approx
                // colorMap[val] = `hsl(${hue}, 70%, 50%)`;
                colorMap[val] = getColorFromString(val + attribute); // Deterministic
            });

            // 3. Apply Style
            if (isVectorTile) {
                if (newLayer.options.vectorTileLayerStyles && newLayer.options.vectorTileLayerStyles[tableName]) {
                    newLayer.options.vectorTileLayerStyles[tableName] = (properties, zoom) => {
                        const val = properties[attribute];
                        const color = colorMap[val] || '#ccc';
                        return {
                            color: color,
                            fillColor: color,
                            weight: parseFloat(weightSlider.value),
                            fillOpacity: 0.5,
                            fill: true
                        };
                    };
                    if (isVisible) newLayer.redraw ? newLayer.redraw() : (map.removeLayer(newLayer), map.addLayer(newLayer));
                }
            } else {
                const markerSize = parseFloat(weightSlider.value) * 12;
                newLayer.eachLayer((layer) => {
                    const val = layer.feature.properties[attribute];
                    const color = colorMap[val] || '#ccc';

                    if (isPointLayer && layer.setIcon) {
                        layer.setIcon(getMarkerIcon(layerStyle.markerType, color, markerSize));
                    } else if (layer.setStyle) {
                        layer.setStyle({
                            color: color,
                            fillColor: color,
                            weight: parseFloat(weightSlider.value),
                            fillOpacity: 0.5
                        });
                    }
                });
            }

            // 4. Render Legend with Color Pickers
            legendContainer.innerHTML = sortedValues.map(val => `
                <div class="legend-item" data-value="${val}">
                    <input type="color" class="legend-color-picker" value="${colorMap[val]}" style="visibility:hidden; position:absolute;">
                    <div class="legend-color-box" style="background: ${colorMap[val]}; cursor: pointer;" title="Change color" onclick="this.previousElementSibling.click()"></div>
                    <div class="legend-label" title="${val}">${val}</div>
                </div>
            `).join('');

            // Add Event Listeners for Manual Color Change
            const legendPickers = legendContainer.querySelectorAll('.legend-color-picker');
            legendPickers.forEach(picker => {
                picker.addEventListener('input', (e) => {
                    const newVal = e.target.value;
                    const item = e.target.closest('.legend-item');
                    const category = item.getAttribute('data-value');
                    const box = item.querySelector('.legend-color-box');

                    // Update UI
                    box.style.background = newVal;

                    // Update Logic
                    colorMap[category] = newVal;

                    // Re-apply Style
                    if (isVectorTile) {
                        if (newLayer.options.vectorTileLayerStyles && newLayer.options.vectorTileLayerStyles[tableName]) {
                            // Force update vector grid style
                            // We need to re-define the style function to use the updated colorMap closure
                            newLayer.options.vectorTileLayerStyles[tableName] = (properties, zoom) => {
                                const val = properties[attribute];
                                const color = colorMap[val] || '#ccc';
                                return {
                                    color: color,
                                    fillColor: color,
                                    weight: parseFloat(weightSlider.value),
                                    fillOpacity: 0.5,
                                    fill: true
                                };
                            };
                            if (isVisible) newLayer.redraw ? newLayer.redraw() : (map.removeLayer(newLayer), map.addLayer(newLayer));
                        }
                    } else {
                        const markerSize = parseFloat(weightSlider.value) * 12;
                        newLayer.eachLayer((layer) => {
                            const val = layer.feature.properties[attribute];
                            // Only update if this feature belongs to the modified category
                            if (val == category) {
                                if (isPointLayer && layer.setIcon) {
                                    layer.setIcon(getMarkerIcon(layerStyle.markerType, newVal, markerSize));
                                } else if (layer.setStyle) {
                                    layer.setStyle({
                                        color: newVal,
                                        fillColor: newVal
                                    });
                                }
                            }
                        });
                    }
                });
            });
        };

        attributeSelect.addEventListener('change', (e) => {
            classifyLayer(e.target.value);
        });

        // Color Picker Event
        colorInput.addEventListener('input', (e) => {
            // If categorized, reset to single symbol first? Or just update single symbol override.
            // For now, if dropdown has value, maybe we should disable single color picker or reset dropdown.
            if (attributeSelect.value) {
                attributeSelect.value = ""; // Reset categorization
                legendContainer.innerHTML = "";
            }
            updateStyle(e.target.value, weightSlider.value);
        });

        // Weight Slider Event
        weightSlider.addEventListener('input', (e) => {
            // If categorized, we need to re-apply classification to update weight
            if (attributeSelect.value) {
                classifyLayer(attributeSelect.value);
            } else {
                updateStyle(colorInput.value, e.target.value);
            }
        });

        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isVisible = !isVisible;
            if (isVisible) {
                map.addLayer(newLayer);
                layerCard.classList.add('active');
                toggleBtn.style.color = 'var(--accent-amber)';
                toggleBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
            } else {
                map.removeLayer(newLayer);
                layerCard.classList.remove('active');
                toggleBtn.style.color = '#555';
                toggleBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
            }
        });

        // Random Color Logic
        const btnRandom = layerCard.querySelector('.btn-random-color');
        if (btnRandom) {
            btnRandom.addEventListener('click', (e) => {
                e.stopPropagation();

                // If we are in categorized mode, maybe randomize the palette? 
                // For now, let's reset to unique random per feature (existing logic) OR 
                // if an attribute is selected, maybe re-generate colors for that attribute?

                if (attributeSelect.value) {
                    // Re-run classify to re-generate colors (if using random seed)? 
                    // For now, deterministic. So existing random logic is actually "Unique per Feature ID".
                    attributeSelect.value = "";
                    legendContainer.innerHTML = "";
                }

                if (isVectorTile) {
                    if (newLayer.options.vectorTileLayerStyles && newLayer.options.vectorTileLayerStyles[tableName]) {
                        newLayer.options.vectorTileLayerStyles[tableName] = (properties, zoom) => {
                            const id = properties.id || Math.random().toString();
                            const color = getColorFromString(id + Math.random()); // Truly random now? or just different seed
                            return {
                                color: color,
                                fillColor: color,
                                weight: 1,
                                fillOpacity: 0.5,
                                fill: true
                            };
                        };
                        if (isVisible) {
                            newLayer.redraw ? newLayer.redraw() : (map.removeLayer(newLayer), map.addLayer(newLayer));
                        }
                    }
                } else {
                    newLayer.eachLayer((layer) => {
                        const id = layer.feature.properties.id || Math.random().toString();
                        const color = getColorFromString(id + Math.random());
                        layer.setStyle({
                            color: color,
                            fillColor: color,
                            weight: 1,
                            fillOpacity: 0.5
                        });
                    });
                }
            });
        }

        tocContainer.prepend(layerCard);

        // Zoom ke data (Hanya untuk GeoJSON, MVT skip auto-zoom)
        if (!isVectorTile) {
            try {
                const bounds = newLayer.getBounds();
                if (bounds.isValid()) map.fitBounds(bounds);
            } catch (e) { }
        }

        // Logika Klik Kanan untuk Remove Permanen
        const contextMenu = document.getElementById('layer-context-menu');
        layerCard.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            contextMenu.style.display = 'block';
            contextMenu.style.left = `${e.pageX}px`;
            contextMenu.style.top = `${e.pageY}px`;

            contextMenu.onclick = () => {
                // Hapus dari Peta dan TOC (Data tetap aman di Database/Katalog)
                map.removeLayer(newLayer);
                layerCard.remove();
                contextMenu.style.display = 'none';

                // Hapus dari LocalStorage
                removeLayerFromStorage(tableName);

                if (tocContainer.children.length === 0) {
                    tocContainer.innerHTML = `
                        <div style="padding: 15px; text-align: center; color: var(--text-muted); font-size: 11px; border: 1px dashed #333; border-radius: 8px;">
                            No thematic layers added yet. Upload a SHP or GeoJSON to start.
                        </div>
                    `;
                }
            };
        });

        // Simpan ke LocalStorage saat layer ditambahkan
        saveLayerToStorage(tableName, layerName, isVectorTile);

        // Sembunyikan context menu saat klik di luar
        document.addEventListener('click', () => {
            contextMenu.style.display = 'none';
        });

        // Layer Selection Logic (Highlight Last Clicked)
        layerCard.addEventListener('click', (e) => {
            // Prevent triggering when clicking buttons inside the card
            if (e.target.closest('button') || e.target.closest('input')) return;

            // Remove selected class from all other cards
            document.querySelectorAll('.layer-card').forEach(card => card.classList.remove('selected'));

            // Add selected class to this card
            layerCard.classList.add('selected');
        });
    };

    // Logika Upload SHP/GeoJSON
    const uploadInput = document.getElementById('shp-upload');

    uploadInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        const btnUpload = document.querySelector('.btn-upload');
        const originalText = btnUpload.innerHTML;
        btnUpload.innerText = "UPLOADING...";
        btnUpload.disabled = true;

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Upload failed");
            }

            const result = await response.json();
            const layerName = result.display_name || file.name.replace(/\.[^/.]+$/, "");
            const tableName = result.table_name;

            addLayerToMap(result.data, layerName, tableName);

        } catch (err) {
            console.error(err);
            // Tampilkan pesan error yang lebih spesifik jika ada
            alert(err.message);
        } finally {
            btnUpload.innerHTML = originalText;
            btnUpload.disabled = false;
        }
    });

    // --- LOGIKA KATALOG LAYER (CARDS) ---
    const catalogModal = document.getElementById('catalog-modal');
    const attributeModal = document.getElementById('attribute-modal');
    const catalogContainer = document.getElementById('catalog-container');
    const btnOpenCatalog = document.getElementById('btn-open-catalog');


    const renderCatalog = (data) => {
        if (!data || data.length === 0) {
            catalogContainer.innerHTML = `
                <div style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--text-muted);">
                    <p>No layers saved in database.</p>
                </div>
            `;
            return;
        }

        catalogContainer.innerHTML = data.map(item => `
            <div class="catalog-card" data-table="${item.table_name}">
                <div class="card-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L2 7l10 5l10-5l-10-5zM2 17l10 5l10-5M2 12l10 5l10-5"></path>
                    </svg>
                </div>
                <div class="card-info">
                    <div class="card-header-row">
                        <div class="card-title" title="${item.display_name}">${item.display_name}</div>
                        <div class="card-type-badge">${item.geometry_type}</div>
                    </div>
                    <div class="card-date">${item.created_at}</div>
                </div>
                <div class="card-actions">
                    <button class="btn-card btn-load" onclick="event.stopPropagation(); loadLayerFromCatalog('${item.table_name}', '${item.display_name}')">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 11 12 14 22 4"></polyline>
                        </svg>
                        LOAD
                    </button>
                    <button class="btn-card btn-delete-card" onclick="event.stopPropagation(); deleteLayerFromCatalog('${item.table_name}', '${item.display_name}')" title="Delete Layer">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    };

    // Toggle checkbox saat kartu diklik


    btnOpenCatalog.addEventListener('click', async () => {
        catalogModal.style.display = 'flex';
        catalogContainer.innerHTML = `<div style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--text-muted);">Loading catalog...</div>`;

        try {
            const response = await fetch('/api/catalog');
            const data = await response.json();
            renderCatalog(data);
        } catch (err) {
            catalogContainer.innerHTML = `<div style="grid-column: 1/-1; padding: 40px; text-align: center; color: #ff4d4d;">Error loading catalog: ${err.message}</div>`;
        }
    });

    // Ekspos ke global scope untuk onclick di HTML string
    window.loadLayerFromCatalog = async (tableName, displayName) => {
        try {
            const response = await fetch(`/api/layers/${tableName}`);
            if (!response.ok) throw new Error("Gagal mengambil data layer");
            const data = await response.json();

            // Cek duplikasi di TOC
            if (document.getElementById('toc-layers').innerText.includes(displayName)) {
                alert("Layer ini sudah ada di peta.");
                return;
            }

            addLayerToMap(data, displayName, tableName);

            // Explicitly close modal
            const modal = document.getElementById('catalog-modal');
            if (modal) modal.style.display = 'none';

        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    window.deleteLayerFromCatalog = async (tableName, displayName) => {
        if (!confirm(`Hapus layer "${displayName}" secara permanen?`)) return;

        try {
            const response = await fetch('/api/delete-layer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table_name: tableName })
            });

            if (!response.ok) throw new Error("Gagal menghapus layer dari database");

            // 1. Sinkronisasi Peta & TOC (AJAX)
            // Hapus layer dari peta jika sedang aktif
            if (activeLeafletLayers[tableName]) {
                map.removeLayer(activeLeafletLayers[tableName]);
                delete activeLeafletLayers[tableName];
            }

            // Hapus kartu layer dari TOC (Sidebar)
            const tocLayers = document.querySelectorAll('.layer-card');
            tocLayers.forEach(card => {
                if (card.tableName === tableName) {
                    card.remove();
                }
            });

            // Jika TOC kosong setelah penghapusan, munculkan pesan "No layers"
            const tocContainer = document.getElementById('toc-layers');
            if (tocContainer && tocContainer.children.length === 0) {
                tocContainer.innerHTML = `
                    <div style="padding: 15px; text-align: center; color: var(--text-muted); font-size: 11px; border: 1px dashed #333; border-radius: 8px;">
                        No thematic layers added yet. Upload a SHP or GeoJSON to start.
                    </div>
                `;
            }

            // Hapus juga dari LocalStorage persitence
            removeLayerFromStorage(tableName);

            // 2. Refresh Tampilan di Dialog Katalog
            const catResponse = await fetch('/api/catalog');
            const data = await catResponse.json();
            renderCatalog(data);

            console.log(`Layer ${tableName} successfully removed via AJAX.`);

        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    // --- COORDINATE PLOTTING LOGIC ---
    const coordinateModal = document.getElementById('coordinate-modal');
    const btnOpenCoordinates = document.getElementById('btn-open-coordinates');
    const btnPlotMarkers = document.getElementById('btn-plot-markers');
    const btnClearMarkers = document.getElementById('btn-clear-markers');
    const coordinateInput = document.getElementById('coordinate-input');

    // Layer Group for Markers
    const coordinateLayerGroup = L.layerGroup().addTo(map);

    btnOpenCoordinates.addEventListener('click', () => {
        coordinateModal.style.display = 'flex';
        coordinateInput.focus();
    });

    btnClearMarkers.addEventListener('click', () => {
        coordinateLayerGroup.clearLayers();
        coordinateInput.value = ''; // Optional: clear input too?
    });

    btnPlotMarkers.addEventListener('click', async () => {
        const layerName = document.getElementById('layer-name-input').value.trim();
        const text = coordinateInput.value;
        if (!text.trim()) {
            alert("Please enter coordinates.");
            return;
        }

        const lines = text.split('\n');
        let coordinates = [];
        let validCount = 0;

        if (!layerName) {
            alert("Please enter a Layer Name.");
            return;
        }

        lines.forEach((line, index) => {
            const parts = line.split(',');
            if (parts.length >= 2) {
                const lon = parseFloat(parts[0].trim());
                const lat = parseFloat(parts[1].trim());

                if (!isNaN(lon) && !isNaN(lat)) {
                    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
                        coordinates.push([lon, lat]);
                        validCount++;
                    }
                }
            }
        });

        if (validCount === 0) {
            alert("No valid coordinates found.");
            return;
        }

        const btnOriginalText = btnPlotMarkers.innerText;
        btnPlotMarkers.innerText = "SAVING...";
        btnPlotMarkers.disabled = true;

        try {
            const response = await fetch('/api/create-point-layer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: layerName, coordinates: coordinates })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to save layer");
            }

            const result = await response.json();

            // Add the new layer to the map
            addLayerToMap(result.data, result.display_name, result.table_name);

            // Close modal and reset
            coordinateModal.style.display = 'none';
            document.getElementById('layer-name-input').value = "";
            coordinateInput.value = "";

            alert(`Layer "${result.display_name}" created successfully!`);

        } catch (e) {
            console.error(e);
            alert(e.message);
        } finally {
            btnPlotMarkers.innerText = btnOriginalText;
            btnPlotMarkers.disabled = false;
        }
    });


    // Close modal when clicking outside
    [catalogModal, attributeModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    });

    // --- ATTRIBUTE TABLE & COLUMN SELECTION LOGIC ---
    const btnAttributeTable = document.getElementById('btn-attribute-table');
    const attributeContainer = document.getElementById('attribute-container');
    const attrModalTitle = document.getElementById('attribute-modal-title');
    const colSelectorDropdown = document.getElementById('column-selector-dropdown');
    const btnToggleColumns = document.getElementById('btn-toggle-columns');
    const colCheckboxList = document.getElementById('column-checkbox-list');
    const btnSelectAllCols = document.getElementById('btn-select-all-cols');

    let currentAttrData = null; // Stores current GeoJSON
    let allColumns = [];
    let visibleColumns = [];

    // Toggle Column Dropdown
    btnToggleColumns.addEventListener('click', (e) => {
        e.stopPropagation();
        colSelectorDropdown.classList.toggle('active');
    });

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
        if (!colSelectorDropdown.contains(e.target) && e.target !== btnToggleColumns) {
            colSelectorDropdown.classList.remove('active');
        }
    });

    const initColumnSelector = (headers) => {
        allColumns = headers;
        visibleColumns = [...headers]; // Default: all visible

        renderColumnCheckboxes();
    };

    const renderColumnCheckboxes = () => {
        colCheckboxList.innerHTML = allColumns.map(col => `
            <div class="column-item">
                <input type="checkbox" id="col-check-${col}" value="${col}" ${visibleColumns.includes(col) ? 'checked' : ''}>
                <label for="col-check-${col}" style="cursor:pointer; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${col}</label>
            </div>
        `).join('');

        // Add listeners to checkboxes
        colCheckboxList.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', () => {
                const col = input.value;
                if (input.checked) {
                    if (!visibleColumns.includes(col)) visibleColumns.push(col);
                } else {
                    visibleColumns = visibleColumns.filter(c => c !== col);
                }
                // Re-render table
                if (currentAttrData) {
                    attributeContainer.innerHTML = renderAttributeTable(currentAttrData);
                }
            });
        });
    };

    btnSelectAllCols.addEventListener('click', () => {
        visibleColumns = [...allColumns];
        renderColumnCheckboxes();
        if (currentAttrData) {
            attributeContainer.innerHTML = renderAttributeTable(currentAttrData);
        }
    });

    btnAttributeTable.addEventListener('click', async () => {
        const selectedLayerCard = document.querySelector('.layer-card.selected');
        if (!selectedLayerCard) {
            alert("Please select a layer from the Table of Contents first.");
            return;
        }

        const data = selectedLayerCard.layerData;
        const layerName = selectedLayerCard.querySelector('span').innerText;

        attrModalTitle.innerText = `ATTRIBUTES: ${layerName}`;
        attributeModal.style.display = 'flex';
        attributeContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">Processing attributes...</div>';

        if (data && data.features) {
            currentAttrData = data;
            const headers = Object.keys(data.features[0].properties);
            initColumnSelector(headers);
            attributeContainer.innerHTML = renderAttributeTable(data);
        } else if (selectedLayerCard.isVectorTile && selectedLayerCard.tableName) {
            try {
                attributeContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">Fetching attributes from server...</div>';
                const response = await fetch(`/api/layer-attributes/${selectedLayerCard.tableName}`);
                if (!response.ok) throw new Error("Failed to load attributes");

                const attributes = await response.json();
                const mockGeoJSON = {
                    features: attributes.map(attr => ({ properties: attr }))
                };
                currentAttrData = mockGeoJSON;

                if (attributes.length > 0) {
                    const headers = Object.keys(attributes[0]);
                    initColumnSelector(headers);
                    attributeContainer.innerHTML = renderAttributeTable(mockGeoJSON);
                } else {
                    attributeContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">No records found in database.</div>';
                }

            } catch (e) {
                console.error(e);
                attributeContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: #ff4d4d;">Error loading data: ${e.message}</div>`;
            }
        } else {
            alert("No attribute data available for this layer.");
            attributeModal.style.display = 'none';
        }
    });

    const renderAttributeTable = (geoJSON) => {
        if (!geoJSON.features || geoJSON.features.length === 0) {
            return '<div style="padding: 20px; text-align: center; color: var(--text-muted);">No features found.</div>';
        }

        if (visibleColumns.length === 0) {
            return '<div style="padding: 40px; text-align: center; color: var(--text-muted);">No columns selected. Use the "Choose Columns" button.</div>';
        }

        const maxRows = 2000;
        const features = geoJSON.features.slice(0, maxRows);

        let html = '<div style="overflow: auto; height: 100%;"><table class="attr-table"><thead><tr>';
        visibleColumns.forEach(h => html += `<th>${h}</th>`);
        html += '</tr></thead><tbody>';

        features.forEach(f => {
            html += '<tr>';
            visibleColumns.forEach(h => {
                const val = f.properties[h];
                html += `<td>${val !== undefined && val !== null ? val : ''}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';

        if (geoJSON.features.length > maxRows) {
            html += `<div style="padding: 10px; text-align: center; color: var(--text-muted); font-size: 11px;">Showing first ${maxRows} rows of ${geoJSON.features.length}</div>`;
        }
        html += '</div>';

        return html;
    };

    console.log('TerraGIS Initialized with Layer Catalog');

    // Load persisted layers on startup
    loadPersistedLayers();

    setTimeout(() => {
        map.invalidateSize();
    }, 500);
});

