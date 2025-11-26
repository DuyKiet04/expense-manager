import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Image, Tag, Button, message, Input } from 'antd';
import { AimOutlined, SearchOutlined } from '@ant-design/icons';
import L from 'leaflet';
import { useState, useRef, useMemo } from 'react';
import axios from 'axios'; 
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Hàm lấy icon màu (Giữ nguyên)
const getCategoryIcon = (type) => {
    let className = 'custom-pin ';
    if (type === 'INCOME') className += 'pin-income';
    else if (type === 'SAVING') className += 'pin-saving';
    else if (type === 'DEBT_LENT' || type === 'DEBT_BORROWED') className += 'pin-debt';
    else className += 'pin-expense'; 

    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="${className}"></div>`,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -35]
    });
};

const SelectionIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="pulse-marker"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

const reverseGeocode = async (lat, lng, cb) => {
    try { const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`); if(cb) cb(res.data.display_name); } catch(e){}
};

const DraggableMarker = ({ position, setPosition, onAddressFound }) => {
    const markerRef = useRef(null);
    const eventHandlers = useMemo(() => ({
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                const newPos = marker.getLatLng();
                setPosition(newPos);
                reverseGeocode(newPos.lat, newPos.lng, onAddressFound);
            }
        },
    }), []);
    useMapEvents({ click(e) { setPosition(e.latlng); reverseGeocode(e.latlng.lat, e.latlng.lng, onAddressFound); } });
    return position ? <Marker draggable={true} eventHandlers={eventHandlers} position={position} ref={markerRef} icon={SelectionIcon}><Popup>Vị trí đã chọn</Popup></Marker> : null;
};

const MapControls = ({ setPosition, onAddressFound }) => {
    const map = useMap();
    const [query, setQuery] = useState('');
    const handleLocate = () => {
        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            const newPos = { lat: latitude, lng: longitude };
            setPosition(newPos); map.flyTo(newPos, 16); reverseGeocode(latitude, longitude, onAddressFound);
        });
    };
    const handleSearch = async () => {
        const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
        if (res.data?.[0]) {
            const { lat, lon, display_name } = res.data[0];
            const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
            setPosition(newPos); map.flyTo(newPos, 16); onAddressFound(display_name);
        } else { message.error("Không tìm thấy"); }
    };
    return (
        <div className="leaflet-top leaflet-right" style={{ pointerEvents: 'auto', marginTop: 10, marginRight: 10, display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', background: 'white', padding: 5, borderRadius: 8 }}>
                <Input placeholder="Tìm..." style={{ width: 120, border: 'none', fontSize: 12 }} value={query} onChange={(e) => setQuery(e.target.value)} onPressEnter={handleSearch} />
                <Button type="primary" size="small" icon={<SearchOutlined />} onClick={handleSearch} />
            </div>
            <Button type="default" shape="circle" icon={<AimOutlined />} onClick={handleLocate} />
        </div>
    );
};

export const MapPicker = ({ onLocationSelect, onAddressSelect }) => {
    const [position, setPosition] = useState(null);
    const handleSet = (pos) => { setPosition(pos); onLocationSelect(pos); };
    return (
        <MapContainer center={[10.762, 106.660]} zoom={13} style={{ height: '300px', width: '100%', borderRadius: 8 }}>
            <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" attribution="Google Maps" />
            <DraggableMarker position={position} setPosition={handleSet} onAddressFound={onAddressSelect} />
            <MapControls setPosition={handleSet} onAddressFound={onAddressSelect} />
        </MapContainer>
    );
};


export const ExpenseMapDisplay = ({ expenses }) => {
    const valid = expenses.filter(e => e.lat && e.lng && !isNaN(Number(e.lat)));
    if (valid.length === 0) return <div style={{padding:20, textAlign:'center', background:'#eee'}}>Chưa có dữ liệu vị trí.</div>;
    return (
        <MapContainer center={[valid[0].lat, valid[0].lng]} zoom={13} style={{ height: '100%', width: '100%', borderRadius: 12 }}>
            <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" attribution="Google Maps" />
            {valid.map(item => (
                <Marker key={item.id} position={[item.lat, item.lng]} icon={getCategoryIcon(item.category?.type)}>
                    {/* autoPan: Tự động trượt bản đồ để thấy Popup trọn vẹn */}
                    <Popup autoPan={true} minWidth={150} maxWidth={200}> 
                        <div style={{ textAlign: 'center' }}>
                            <b style={{fontSize: 13, display:'block', marginBottom: 2}}>{item.note}</b>
                            <div style={{ color: 'red', fontWeight: 'bold', fontSize: 14, marginBottom: 5 }}>
                                {Number(item.amount).toLocaleString()} đ
                            </div>
                            <Tag color="blue" style={{fontSize: 10}}>{item.category?.name}</Tag>
                            
                            
                            {item.address && (
                                <div style={{
                                    fontSize: 10, color: '#666', margin: '5px 0',
                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis'
                                }}>
                                    {item.address}
                                </div>
                            )}

                            {item.imageUrl && <img src={item.imageUrl} style={{width: '100%', height: 80, objectFit: 'cover', borderRadius: 4, marginTop: 5}} />}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};