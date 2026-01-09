# Quick Start Guide - Email Configuration

## What's Been Done

✅ Both contact forms now send formatted emails via EmailJS
✅ Professional email templates with all form data
✅ Success/error messages for users
✅ Form validation and loading states

## 3-Step Setup (Takes 5 minutes)

### Step 1: Create Free EmailJS Account
1. Go to: **https://www.emailjs.com/**
2. Click "Sign Up" (free account = 200 emails/month)
3. Verify your email

### Step 2: Connect Your Gmail
1. In EmailJS dashboard → **Email Services** → **Add New Service**
2. Select **Gmail**
3. Click **Connect Account** and authorize
4. Copy your **Service ID** (looks like: `service_abc1234`)

### Step 3: Create Two Email Templates

#### Template A - For Propietarios (Property Owners)
1. Go to **Email Templates** → **Create New Template**
2. Name it: `Propietarios Form`
3. **To Email**: `contacto@aluri.co` (or your email)
4. **Subject**: `Nueva Solicitud - {{nombre}}`
5. **Body**: Copy this HTML:

```html
<h2>Solicitud de Crédito de Propietario</h2>

<p><strong>Nombre:</strong> {{nombre}}</p>
<p><strong>Email:</strong> {{email}}</p>
<p><strong>Teléfono:</strong> {{telefono_codigo}} {{telefono}}</p>
<p><strong>Cédula:</strong> {{cedula}}</p>

<h3>Detalles:</h3>
<p><strong>Tipo de Propiedad:</strong> {{propiedad}}</p>
<p><strong>Ubicación:</strong> {{ubicacion}}</p>
<p><strong>Monto:</strong> {{monto}}</p>
```

6. Save and copy the **Template ID** (looks like: `template_xyz5678`)

#### Template B - For Inversionistas (Investors)
1. Create another template: `Inversionistas Form`
2. **To Email**: `contacto@aluri.co`
3. **Subject**: `Nueva Inversión - {{nombre}}`
4. **Body**: Copy this HTML:

```html
<h2>Solicitud de Inversionista</h2>

<p><strong>Nombre:</strong> {{nombre}}</p>
<p><strong>Email:</strong> {{email}}</p>
<p><strong>Teléfono:</strong> {{telefono}}</p>
<p><strong>Ciudad:</strong> {{ciudad}}</p>
<p><strong>Monto a Invertir:</strong> {{montoInversion}}</p>

<h3>Perfil:</h3>
<p>{{mensaje}}</p>
```

5. Save and copy the **Template ID**

### Step 4: Get Your Public Key
1. Go to **Account** → **General**
2. Copy your **Public Key** (looks like: `user_abc123xyz`)

### Step 5: Update 2 Files

#### File 1: `propietarios.html` (Around line 506)
Find these two lines and replace with YOUR values:
```javascript
emailjs.init('YOUR_PUBLIC_KEY');  // Line ~506
emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', formData)  // Line ~526
```

Replace with:
```javascript
emailjs.init('user_abc123xyz');  // Your public key
emailjs.send('service_abc1234', 'template_propietarios_xyz', formData)
```

#### File 2: `inversionistas.html` (Around line 330)
Find these two lines and replace with YOUR values:
```javascript
emailjs.init('YOUR_PUBLIC_KEY');  // Line ~330
emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', formData)  // Line ~350
```

Replace with:
```javascript
emailjs.init('user_abc123xyz');  // Your public key
emailjs.send('service_abc1234', 'template_inversionistas_xyz', formData)
```

## Testing

1. Open `propietarios.html` in your browser
2. Fill out the form with test data
3. Click submit
4. Check your email inbox (the "To Email" you configured)
5. You should receive a formatted email!
6. Repeat for `inversionistas.html`

## What Happens When Users Submit

1. **Before**: Button says "Quiero Solicitar Capital"
2. **During**: Button shows "Enviando..." (animated)
3. **Success**: ✓ Button turns green, shows "Enviado correctamente", form clears
4. **Error**: ✗ Button turns red, shows error message with fallback email

## Troubleshooting

**"Error al enviar" message?**
- Double-check your Public Key, Service ID, and Template IDs
- Make sure they're copied exactly (no extra spaces)
- Verify your Gmail is connected in EmailJS dashboard

**Not receiving emails?**
- Check your spam folder
- Verify the "To Email" in your EmailJS template
- Make sure you're under 200 emails/month limit (free plan)

**Need more emails?**
- EmailJS paid plans start at $7/month for 1000 emails
- Or use alternative: Formspree, SendGrid, or your own backend

## Email Format Preview

### Propietarios Email:
```
Subject: Nueva Solicitud - Juan Pérez

Solicitud de Crédito de Propietario

Nombre: Juan Pérez
Email: juan@example.com
Teléfono: +57 300 123 4567
Cédula: 123456789

Detalles:
Tipo de Propiedad: Sí, soy único propietario
Ubicación: Bogotá
Monto: Entre $40 y $60 millones
```

### Inversionistas Email:
```
Subject: Nueva Inversión - María González

Solicitud de Inversionista

Nombre: María González
Email: maria@example.com
Teléfono: 300 123 4567
Ciudad: Medellín
Monto a Invertir: $50.000.000

Perfil:
Inversionista con experiencia en inmuebles...
```

## Done! 🎉

Your contact forms are now fully functional and will send professional emails to your inbox.
