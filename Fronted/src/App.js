import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx'; 
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

// IMPORTACIÓN DE COMPONENTES Y DATOS
// Asegúrate de que estas rutas existan en tu proyecto
import { PRODUCTOS, INITIAL_COMPRA, INITIAL_VENTA } from './data/config';
import Navbar from './components/Navbar';
import { ModalPago, ModalDevolucion, ModalConfirmacion } from './components/Modales';
import Dashboard from './pages/Dashboard';
import Ventas from './pages/Ventas';
import Compras from './pages/Compras';
import Reportes from './pages/Reportes';
import './App.css';

// URL DEL BACKEND
const API_URL = 'http://localhost:5000/api';

export default function ControlCarnico() {
  // --- 1. ESTADO GLOBAL ---
  const [producto, setProducto] = useState('pollo'); 
  const [compras, setCompras] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [inventario, setInventario] = useState(0);
  
  const [listaClientes, setListaClientes] = useState([]);
  const [listaProveedores, setListaProveedores] = useState([]);
  
  const [vistaActual, setVistaActual] = useState('dashboard');
  
  // Estados para Modales
  const [mostrarPago, setMostrarPago] = useState(false);
  const [tipoPagoModal, setTipoPagoModal] = useState('cliente'); 
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null);
  
  const [mostrarDevolucion, setMostrarDevolucion] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  
  const [itemAEliminar, setItemAEliminar] = useState(null);
  const [tipoEliminacion, setTipoEliminacion] = useState('');
  
  // Edición
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEdicion, setIdEdicion] = useState(null);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');

  // Estados de Formularios
  const [formCompra, setFormCompra] = useState(INITIAL_COMPRA);
  const [formVenta, setFormVenta] = useState(INITIAL_VENTA);
  const [formPago, setFormPago] = useState({ monto: '', fecha: new Date().toISOString().split('T')[0] });
  const [formDevolucion, setFormDevolucion] = useState({ tipo: 'valor', cantidad: '', observacion: '', fecha: new Date().toISOString().split('T')[0] });

  // --- 2. CARGA DE DATOS DESDE EL BACKEND ---
  const cargarDatos = async () => {
    try {
      const resVentas = await fetch(`${API_URL}/ventas`);
      const dataVentas = await resVentas.json();
      
      const resCompras = await fetch(`${API_URL}/compras`);
      const dataCompras = await resCompras.json();

      const v = dataVentas
        .filter(i => i.producto === producto)
        .map(x => ({...x, id: x._id}));
      
      const c = dataCompras
        .filter(i => (!i.producto || i.producto === producto))
        .map(x => ({...x, id: x._id}));

      setVentas(v);
      setCompras(c);

      setListaClientes(JSON.parse(localStorage.getItem('db-clientes') || '[]'));
      setListaProveedores(JSON.parse(localStorage.getItem('db-proveedores') || '[]'));

    } catch (error) {
      console.error("Error conectando con el servidor:", error);
    }
  };

  useEffect(() => {
      cargarDatos();
      setFormCompra(INITIAL_COMPRA);
      setFormVenta({...INITIAL_VENTA, pesoPorGaveta: PRODUCTOS[producto].precio_envase});
  }, [producto]);

  // --- 3. CÁLCULO DE INVENTARIO ---
  useEffect(() => {
    if (!compras || !ventas) return;

    const totalEntradas = compras.reduce((sum, c) => sum + (parseFloat(c.pesoNeto) || parseFloat(c.pesoNetoCalculado) || 0), 0);
    const factorMerma = PRODUCTOS[producto].merma;
    
    const totalSalidas = ventas.reduce((sum, v) => {
        const pesoVenta = parseFloat(v.peso) || 0;
        const pesoConsumido = pesoVenta / factorMerma; 
        return sum + pesoConsumido;
    }, 0);

    const stockReal = totalEntradas - totalSalidas;
    setInventario(stockReal < 0.01 ? 0 : stockReal);
    
  }, [compras, ventas, producto]);

  // --- 4. CÁLCULOS AUTOMÁTICOS DE FORMULARIOS ---
  
  useEffect(() => {
    const bruto = parseFloat(formCompra.pesoBruto) || 0;
    const tara = parseFloat(formCompra.pesoTara) || 0;
    const neto = bruto - tara;
    setFormCompra(p => ({ ...p, pesoNetoCalculado: neto > 0 ? neto : 0 }));
  }, [formCompra.pesoBruto, formCompra.pesoTara]);

  useEffect(() => {
    const bruto = parseFloat(formVenta.pesoBruto) || 0;
    let descuento = 0;
    if (formVenta.tipoEnvase === 'gaveta') {
        descuento = (parseFloat(formVenta.cantidadGavetas)||0) * (parseFloat(formVenta.pesoPorGaveta)||0);
    }
    const neto = bruto - descuento;
    setFormVenta(p => ({ ...p, peso: neto > 0 ? neto.toFixed(2) : '' }));
  }, [formVenta.pesoBruto, formVenta.tipoEnvase, formVenta.cantidadGavetas, formVenta.pesoPorGaveta]);

  useEffect(() => {
    if (formCompra.tipoPago === 'total') {
        const t = (formCompra.pesoNetoCalculado||0) * (parseFloat(formCompra.precioLb)||0);
        if(t>0) setFormCompra(p => ({...p, montoPagado: t.toFixed(2)}));
    } else if (formCompra.tipoPago === 'abono' && !modoEdicion) {
        setFormCompra(p => ({...p, montoPagado: ''}));
    }
  }, [formCompra.tipoPago, formCompra.pesoNetoCalculado, formCompra.precioLb, modoEdicion]);

  useEffect(() => {
      if (formVenta.tipoPago === 'total') {
          const t = (parseFloat(formVenta.peso)||0) * (parseFloat(formVenta.precioLb)||0);
          if(t>0) setFormVenta(p => ({...p, montoPagado: t.toFixed(2)}));
      } else if (formVenta.tipoPago === 'abono' && !modoEdicion) {
          setFormVenta(p => ({...p, montoPagado: ''}));
      }
  }, [formVenta.tipoPago, formVenta.peso, formVenta.precioLb, modoEdicion]);


  // --- 5. LÓGICA DE NEGOCIO ---

  const actualizarDirectorio = (nombre, tipo) => {
      const limpio = nombre.trim();
      if (!limpio) return;
      if (tipo === 'cliente' && !listaClientes.includes(limpio)) {
          const n = [...listaClientes, limpio].sort();
          setListaClientes(n); localStorage.setItem('db-clientes', JSON.stringify(n));
      } else if (tipo === 'proveedor' && !listaProveedores.includes(limpio)) {
          const n = [...listaProveedores, limpio].sort();
          setListaProveedores(n); localStorage.setItem('db-proveedores', JSON.stringify(n));
      }
  };

  const procesarVenta = async () => {
    if (!formVenta.cliente || !formVenta.peso || !formVenta.precioLb) return alert('Faltan datos');
    actualizarDirectorio(formVenta.cliente, 'cliente');

    const pesoVendido = parseFloat(formVenta.peso);
    
    const descuentoInventario = (pesoVendido / PRODUCTOS[producto].merma);
    if (!modoEdicion && descuentoInventario > inventario) {
        if(!window.confirm(`⚠️ Inventario bajo.\nSe descontarán aprox: ${descuentoInventario.toFixed(2)} lb\nDisponible: ${inventario.toFixed(2)} lb\n¿Vender igual?`)) return;
    }

    const total = pesoVendido * parseFloat(formVenta.precioLb);
    const pagado = formVenta.tipoPago === 'total' ? total : (parseFloat(formVenta.montoPagado) || 0);

    const nuevaVenta = {
        ...formVenta,
        producto: producto, 
        peso: pesoVendido, 
        total, 
        pagado, 
        saldo: total - pagado,
        pagos: (pagado > 0 && !modoEdicion) ? [{monto: pagado, fecha: formVenta.fecha}] : []
    };

    try {
        if (modoEdicion) {
            await fetch(`${API_URL}/ventas/${idEdicion}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(nuevaVenta)
            });
        } else {
            await fetch(`${API_URL}/ventas`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(nuevaVenta)
            });
        }
        
        cargarDatos();
        setFormVenta({...INITIAL_VENTA, pesoPorGaveta: PRODUCTOS[producto].precio_envase}); 
        setModoEdicion(false); 
        setIdEdicion(null);
        alert("Venta guardada exitosamente ☁️");

    } catch (e) {
        alert("Error al guardar venta. Revisa tu conexión.");
        console.error(e);
    }
  };

  const procesarCompra = async () => {
    if (!formCompra.proveedor || !formCompra.pesoNetoCalculado) return alert('Faltan datos');
    actualizarDirectorio(formCompra.proveedor, 'proveedor');

    const total = formCompra.pesoNetoCalculado * parseFloat(formCompra.precioLb);
    
    // --- AQUÍ ESTABA EL ERROR, AHORA ESTÁ CORREGIDO ---
    const pagado = formCompra.tipoPago === 'total' ? total : (parseFloat(formCompra.montoPagado) || 0);
    // --------------------------------------------------

    const nuevaCompra = {
      ...formCompra,
      producto: producto,
      pesoNeto: formCompra.pesoNetoCalculado,
      total, 
      pagado, 
      saldo: total - pagado,
      pagos: (pagado > 0 && !modoEdicion) ? [{monto: pagado, fecha: formCompra.fecha}] : []
    };

    try {
        if (modoEdicion) {
             await fetch(`${API_URL}/compras/${idEdicion}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(nuevaCompra)
            });
        } else {
             await fetch(`${API_URL}/compras`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(nuevaCompra)
            });
        }

        cargarDatos();
        setFormCompra(INITIAL_COMPRA); 
        setModoEdicion(false); 
        setIdEdicion(null);
        alert("Compra guardada exitosamente ☁️");

    } catch (e) {
        alert("Error al guardar compra.");
        console.error(e);
    }
  };

  const eliminarItem = async () => {
      if (!itemAEliminar) return;
      
      const endpoint = tipoEliminacion === 'compra' ? 'compras' : 'ventas';
      const idBorrar = itemAEliminar._id || itemAEliminar.id;
      
      try {
          await fetch(`${API_URL}/${endpoint}/${idBorrar}`, { method: 'DELETE' });
          cargarDatos();
          setMostrarConfirmacion(false);
          setItemAEliminar(null);
      } catch (e) {
          alert("Error eliminando registro.");
      }
  };

  const agregarPago = async () => {
      const m = parseFloat(formPago.monto);
      if (!m || m <= 0) return;
      if (m > (transaccionSeleccionada.saldo + 0.5)) return alert('Monto mayor a la deuda');
      
      const item = transaccionSeleccionada;
      const nuevoPagado = (item.pagado || 0) + m;
      const nuevoSaldo = (item.total || 0) - nuevoPagado;
      const nuevosPagos = [...(item.pagos||[]), {monto: m, fecha: formPago.fecha}];
      
      const endpoint = tipoPagoModal === 'cliente' ? 'ventas' : 'compras';
      const idActualizar = item._id || item.id;

      try {
          await fetch(`${API_URL}/${endpoint}/${idActualizar}`, {
              method: 'PUT',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ 
                  pagado: nuevoPagado, 
                  saldo: nuevoSaldo, 
                  pagos: nuevosPagos 
              })
          });
          cargarDatos();
          setMostrarPago(false); 
          setFormPago({...formPago, monto: ''});
      } catch (e) {
          alert("Error registrando pago.");
      }
  };

  const registrarDevolucion = async () => {
      const cantidad = parseFloat(formDevolucion.cantidad);
      if (!cantidad || cantidad <= 0) return;

      const item = transaccionSeleccionada;
      let valorDevolucion = formDevolucion.tipo === 'valor' ? cantidad : (cantidad * item.precioLb);
      
      const nuevoTotal = item.total - valorDevolucion;
      const nuevoSaldo = nuevoTotal - item.pagado;
      const nuevasDevoluciones = [...(item.devoluciones||[]), { 
          fecha: formDevolucion.fecha, 
          cantidad, 
          valor: valorDevolucion, 
          tipo: formDevolucion.tipo 
      }];

      const idActualizar = item._id || item.id;

      try {
        await fetch(`${API_URL}/ventas/${idActualizar}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                total: nuevoTotal, 
                saldo: nuevoSaldo, 
                devoluciones: nuevasDevoluciones 
            })
        });
        cargarDatos();
        setMostrarDevolucion(false);
        setFormDevolucion({...formDevolucion, cantidad: '', observacion: ''});
      } catch (e) {
        alert("Error registrando devolución");
      }
  };

  const exportarExcel = async () => {
    if (!ventas.length && !compras.length) return alert("Sin datos para exportar");
    try {
        const wb = XLSX.utils.book_new();
        
        const dataV = ventas.map(v => ({ 
            Fecha: v.fecha, 
            Cliente: v.cliente, 
            'Peso(lb)': v.peso, 
            'Total($)': v.total, 
            'Deuda($)': v.saldo 
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dataV), "Ventas");
        
        const dataC = compras.map(c => ({ 
            Fecha: c.fecha, 
            Proveedor: c.proveedor, 
            'Peso(lb)': c.pesoNeto, 
            'Total($)': c.total, 
            'Pagado($)': c.pagado, 
            'Deuda($)': c.saldo 
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dataC), "Compras");
        
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
        const fileName = `Reporte_${PRODUCTOS[producto].label}_${new Date().getTime()}.xlsx`;
        
        const savedFile = await Filesystem.writeFile({ 
            path: fileName, 
            data: wbout, 
            directory: Directory.Documents 
        });
        await Share.share({ title: 'Reporte Carnes', url: savedFile.uri });
    } catch (error) { 
        alert("Error al crear Excel. (Funciona mejor en móvil)"); 
    }
  };

  const stats = useMemo(() => ({
      cobrar: ventas.reduce((s,v) => s + (v.saldo || 0), 0),
      pagar: compras.reduce((s,c) => s + (c.saldo || 0), 0),
      grafico: Object.values(ventas.reduce((acc, v) => {
         if(!acc[v.fecha]) acc[v.fecha] = {name: v.fecha.slice(5), Ventas: 0};
         acc[v.fecha].Ventas += v.total; return acc;
      }, {})).sort((a,b) => a.name.localeCompare(b.name)).slice(-7)
  }), [ventas, compras]);

  const config = PRODUCTOS[producto];

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 select-none font-sans">
      
      <header className="bg-white pt-2 shadow-sm sticky top-0 z-30">
         <div className="px-6 pb-2 flex justify-between items-center">
            <div>
                <h1 className="text-xl font-black tracking-tighter">
                    Control<span style={{color: config.color}} className="capitalize">{producto}</span>
                </h1>
            </div>
            <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400">Stock</p>
                <p className={`text-lg font-black text-${config.color === 'orange' ? 'orange' : config.color}-600`}>
                    {inventario.toFixed(0)} lb
                </p>
            </div>
         </div>
         <div className="flex overflow-x-auto px-4 pb-2 gap-2 no-scrollbar">
            {Object.entries(PRODUCTOS).map(([key, val]) => (
                <button key={key} onClick={() => setProducto(key)} className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${producto === key ? 'bg-slate-900 text-white shadow-lg transform scale-105' : 'bg-slate-100 text-slate-400'}`}>
                    <span>{val.emoji}</span> {val.label}
                </button>
            ))}
         </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-28 space-y-6">
        {vistaActual === 'dashboard' && <Dashboard stats={stats} config={config} />}
        {vistaActual === 'ventas' && (
            <Ventas 
                formVenta={formVenta} setFormVenta={setFormVenta}
                procesarVenta={procesarVenta} listaClientes={listaClientes}
                producto={producto} config={config} ventas={ventas}
                setModoEdicion={setModoEdicion} setIdEdicion={setIdEdicion}
                setTransaccionSeleccionada={setTransaccionSeleccionada} setTipoPagoModal={setTipoPagoModal} setMostrarPago={setMostrarPago}
                setItemAEliminar={setItemAEliminar} setTipoEliminacion={setTipoEliminacion} setMostrarConfirmacion={setMostrarConfirmacion}
                filtroBusqueda={filtroBusqueda} setFiltroBusqueda={setFiltroBusqueda}
            />
        )}
        {vistaActual === 'compras' && (
            <Compras 
                formCompra={formCompra} setFormCompra={setFormCompra}
                procesarCompra={procesarCompra} listaProveedores={listaProveedores}
                config={config} compras={compras}
                setModoEdicion={setModoEdicion} setIdEdicion={setIdEdicion}
                setTransaccionSeleccionada={setTransaccionSeleccionada} setTipoPagoModal={setTipoPagoModal} setMostrarPago={setMostrarPago}
                setItemAEliminar={setItemAEliminar} setTipoEliminacion={setTipoEliminacion} setMostrarConfirmacion={setMostrarConfirmacion}
            />
        )}
        {vistaActual === 'reportes' && <Reportes producto={producto} exportarExcel={exportarExcel} ventas={ventas} />}
      </main>

      <Navbar vistaActual={vistaActual} setVistaActual={setVistaActual} />
      
      <ModalPago isOpen={mostrarPago} onClose={() => setMostrarPago(false)} transaccion={transaccionSeleccionada} formPago={formPago} setFormPago={setFormPago} agregarPago={agregarPago} />
      <ModalDevolucion isOpen={mostrarDevolucion} onClose={() => setMostrarDevolucion(false)} formDevolucion={formDevolucion} setFormDevolucion={setFormDevolucion} registrarDevolucion={registrarDevolucion} />
      <ModalConfirmacion isOpen={mostrarConfirmacion} onClose={() => setMostrarConfirmacion(false)} eliminarItem={eliminarItem} />
    </div>
  );
}