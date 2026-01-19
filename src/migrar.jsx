import React, { useState, useEffect, useRef } from 'react';

const MigradorDirecto = () => {
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isWorking, setIsWorking] = useState(false);
  const logContainerRef = useRef(null);

  // Auto-scroll al final de la consola
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const iniciarMigracion = () => {
    setIsWorking(true);
    setProgress(0);
    setLogs(["⏳ Estableciendo conexión segura con el servidor..."]);
    
    // URL verificada en Postman (incluye la carpeta /ajax/)
    const url = 'https://apiweb.hitpoly.com/ajax/migracion_hitpoly.php';
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.message) {
          setLogs(prev => [...prev, `[${data.timestamp || ''}] ${data.message}`]);
        }
        
        if (data.progress !== null && data.progress !== undefined) {
          setProgress(data.progress);
        }

        // Si el mensaje contiene el emoji de bandera, cerramos con éxito
        if (data.message.includes("🏁")) {
          setLogs(prev => [...prev, "🎉 Proceso completado exitosamente."]);
          eventSource.close();
          setIsWorking(false);
        }
      } catch (e) {
        console.error("Error al procesar mensaje:", e);
      }
    };

    eventSource.onerror = (err) => {
      // Si el readyState es 2, significa que la conexión se cerró
      if (eventSource.readyState === 2) {
        setLogs(prev => [...prev, "ℹ️ Conexión finalizada por el servidor."]);
      } else {
        setLogs(prev => [...prev, "❌ Error de conexión: Verifica tu conexión a internet o los permisos CORS en el servidor."]);
      }
      eventSource.close();
      setIsWorking(false);
    };
  };

  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: 'auto', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>🚀 Migrador Hitpoly v2.0</h1>
        <p style={{ color: '#7f8c8d' }}>Traspaso masivo de Cloudinary a ImageKit (Web y Academia)</p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px' }}>
        <button 
          onClick={iniciarMigracion} 
          disabled={isWorking}
          style={{ 
            padding: '15px 40px', 
            fontSize: '18px',
            backgroundColor: isWorking ? '#95a5a6' : '#e67e22', 
            color: 'white', 
            border: 'none', 
            borderRadius: '50px', 
            cursor: isWorking ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(230, 126, 34, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          {isWorking ? 'MIGRANDO ACTIVOS...' : '🔥 INICIAR MIGRACIÓN TOTAL'}
        </button>
      </div>

      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold' }}>
        <span>Progreso General</span>
        <span>{progress}%</span>
      </div>
      <div style={{ background: '#ecf0f1', borderRadius: '10px', height: '12px', width: '100%', marginBottom: '30px', overflow: 'hidden' }}>
        <div style={{ 
          width: `${progress}%`, 
          background: 'linear-gradient(90deg, #27ae60, #2ecc71)', 
          height: '100%', 
          transition: 'width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }} />
      </div>

      <div 
        ref={logContainerRef}
        style={{ 
          backgroundColor: '#1a1a1a', 
          color: '#00ff00', 
          padding: '20px', 
          height: '450px', 
          overflowY: 'scroll', 
          borderRadius: '8px',
          fontFamily: 'Consolas, monospace',
          fontSize: '13px',
          lineHeight: '1.6',
          boxShadow: 'inset 0 0 10px #000'
        }}
      >
        {logs.length === 0 && <div style={{ color: '#666' }}>&gt; Sistema listo para iniciar...</div>}
        {logs.map((log, index) => (
          <div key={index} style={{ marginBottom: '4px' }}>
            <span style={{ color: '#555' }}>&gt;</span> {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MigradorDirecto;