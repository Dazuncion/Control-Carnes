export const PRODUCTOS = {
  pollo: { 
    label: 'Pollo', 
    emoji: '🐔', 
    color: 'orange', 
    merma: 0.85,          
    precio_envase: 4.5,   
    texto_compra: 'Gavetas',
    texto_unidad: 'Pollos'
  },
  res: { 
    label: 'Res',   
    emoji: '🐮', 
    color: 'red',    
    merma: 1.0,           
    precio_envase: 0,     
    texto_compra: 'Canal',
    texto_unidad: 'Reses'
  },
  cerdo: { 
    label: 'Cerdo', 
    emoji: '🐷', 
    color: 'pink',   
    merma: 1.0,           
    precio_envase: 0,
    texto_compra: 'Canal',
    texto_unidad: 'Cerdos'
  },
  chivo: { 
    label: 'Chivo', 
    emoji: '🐐', 
    color: 'amber',  
    merma: 1.0,           
    precio_envase: 0,
    texto_compra: 'Canal',
    texto_unidad: 'Chivos'
  }
};

export const INITIAL_COMPRA = {
  fecha: new Date().toISOString().split('T')[0],
  proveedor: '', 
  pesoBruto: '', 
  pesoTara: '', 
  pesoNetoCalculado: 0,
  cantidad: '', 
  precioLb: '', 
  montoPagado: '', 
  tipoPago: 'total', 
  registradoPor: ''
};

export const INITIAL_VENTA = {
  fecha: new Date().toISOString().split('T')[0],
  cliente: '', 
  tipoEnvase: 'funda', 
  cantidadGavetas: '', 
  pesoPorGaveta: 4.5, 
  pesoBruto: '', 
  peso: '', 
  precioLb: '', 
  montoPagado: '', 
  tipoPago: 'total', 
  registradoPor: ''
};