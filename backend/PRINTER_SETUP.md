# Printer System Documentation

## Overview
RestXQR supports automatic order printing to thermal printers using ESC/POS commands over TCP/IP. This system is designed for restaurant kitchens with multiple stations.

## Configuration

### Default Stations
Three stations are pre-configured for testing:

1. **Station 1 - Grill**
   - IP: 192.168.1.13
   - Port: 9100
   - Type: Epson

2. **Station 2 - Cold Kitchen**
   - IP: 192.168.1.14
   - Port: 9100
   - Type: Epson

3. **Station 3 - Bar**
   - IP: 192.168.1.15
   - Port: 9100
   - Type: Epson

### Supported Printer Types
- Epson (default)
- Star
- Tanca

### Character Set
- PC857_TURKISH for proper Turkish character support (ç, ğ, ı, ö, ş, ü)
- Code Page: CP857

## Using the Debug Page

### Access
Navigate to `/debug/printer-test` in your browser to access the printer debug page.

### Features

#### 1. Configuration Management
- Update printer IP addresses
- Change port numbers (default: 9100)
- Enable/disable individual stations
- Select printer type

#### 2. Status Checking
- Click "Check Status" to verify network connectivity
- Green indicator = Printer connected
- Red indicator = Printer offline/unreachable

#### 3. Test Printing
- Click "Test Print" to send a sample receipt
- Test includes Turkish characters to verify encoding
- Sample order includes:
  - Çiğ Köfte - Özel Şişli
  - İçli Köfte
  - Künefe - Fıstıklı

## API Endpoints

### Get All Stations
```
GET /api/printers
```

### Update Station Configuration
```
PUT /api/printers/:station
Body: {
  ip: "192.168.1.13",
  port: 9100,
  enabled: true,
  type: "epson"
}
```

### Check Printer Status
```
GET /api/printers/:station/status
```

### Test Print
```
POST /api/printers/:station/test
```

### Print Order
```
POST /api/printers/:station/print
Body: {
  orderNumber: "ORDER-123",
  tableNumber: "5",
  items: [
    {
      quantity: 2,
      name: "Product Name",
      notes: "Special instructions"
    }
  ]
}
```

### Print to Multiple Stations
```
POST /api/printers/print-order
Body: {
  orderData: { ... },
  stations: ["station1", "station2"]
}
```

## Network Requirements

### Firewall
Ensure the following:
- TCP port 9100 is open on your network
- Printer IP addresses are on the same subnet as your server
- No firewall blocking between server and printers

### Printer Configuration
1. Enable network printing on thermal printer
2. Set static IP address (recommended)
3. Ensure RAW printing is enabled (port 9100)
4. Test network connectivity with ping

## Troubleshooting

### Printer Not Connecting
1. Verify IP address is correct
2. Check printer is powered on
3. Test network connectivity: `ping 192.168.1.13`
4. Ensure port 9100 is accessible
5. Check printer network settings

### Characters Not Displaying Correctly
1. Verify Code Page is set to CP857
2. Check Character Set is PC857_TURKISH
3. Update printer firmware if needed

### Print Job Not Received
1. Check printer status LED
2. Verify paper is loaded
3. Check printer error messages
4. Restart printer
5. Test with different station

## Automatic Order Printing

### How It Works
When an order is placed:
1. Order is created in database
2. System determines which stations need the order
3. Order is formatted with ESC/POS commands
4. Print job is sent to each station via TCP/IP
5. Success/failure is logged

### Configuring Auto-Print
Edit station configurations to match your kitchen workflow:
- Enable only stations that should receive orders
- Update IP addresses to match your printers
- Configure different printer types as needed

## Production Deployment

### Recommended Setup
1. Use static IP addresses for all printers
2. Document IP assignments
3. Create network diagram
4. Configure VLANs for printer network (optional)
5. Regular printer maintenance schedule

### Monitoring
- Check printer status regularly
- Monitor print failures
- Keep backup printers available
- Test daily during non-peak hours

## Support
For issues with the printer system, check:
1. Network connectivity
2. Printer power and paper
3. Backend logs for errors
4. API endpoint responses
