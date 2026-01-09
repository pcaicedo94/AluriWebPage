# Email Setup Instructions for Aluri Contact Forms

## Overview
Both contact forms (Propietarios and Inversionistas) are configured to send emails using **EmailJS**, a free service that allows sending emails from static websites without a backend.

## Setup Steps

### 1. Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account (allows 200 emails/month)
3. Verify your email address

### 2. Create Email Service
1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail recommended for testing)
4. Follow the authentication steps
5. Note your **Service ID** (e.g., `service_abc123`)

### 3. Create Email Templates

#### Template for Propietarios (Property Owners)
1. Go to **Email Templates** → **Create New Template**
2. Template Name: `Propietarios Contact Form`
3. **Subject**: `Nueva Solicitud de Crédito - {{nombre}}`
4. **Content** (HTML format):
```html
<h2>Nueva Solicitud de Crédito de Propietario</h2>

<h3>Información del Solicitante:</h3>
<p><strong>Nombre Completo:</strong> {{nombre}}</p>
<p><strong>Correo Electrónico:</strong> {{email}}</p>
<p><strong>Teléfono:</strong> {{telefono_codigo}} {{telefono}}</p>
<p><strong>Cédula:</strong> {{cedula}}</p>

<h3>Detalles de la Propiedad:</h3>
<p><strong>Tipo de Propiedad:</strong> {{propiedad}}</p>
<p><strong>Ubicación del Inmueble:</strong> {{ubicacion}}</p>

<h3>Solicitud de Crédito:</h3>
<p><strong>Monto Solicitado:</strong> {{monto}}</p>

<h3>Información Adicional:</h3>
<p>{{mensaje}}</p>

<hr>
<p><em>Formulario enviado desde: {{tipo_formulario}}</em></p>
<p><em>Fecha: {{current_date}}</em></p>
```

5. Note your **Template ID** (e.g., `template_xyz789`)

#### Template for Inversionistas (Investors)
1. Create another template: `Inversionistas Contact Form`
2. **Subject**: `Nueva Solicitud de Inversión - {{nombre}}`
3. **Content** (HTML format):
```html
<h2>Nueva Solicitud de Inversionista</h2>

<h3>Información del Inversionista:</h3>
<p><strong>Nombre Completo:</strong> {{nombre}}</p>
<p><strong>Correo Electrónico:</strong> {{email}}</p>
<p><strong>Teléfono:</strong> {{telefono}}</p>
<p><strong>Ciudad:</strong> {{ciudad}}</p>

<h3>Detalles de Inversión:</h3>
<p><strong>Monto Disponible para Invertir:</strong> {{montoInversion}}</p>

<h3>Perfil del Inversionista:</h3>
<p>{{mensaje}}</p>

<hr>
<p><em>Formulario enviado desde: {{tipo_formulario}}</em></p>
<p><em>Fecha: {{current_date}}</em></p>
```

4. Note your **Template ID**

### 4. Get Your Public Key
1. Go to **Account** → **General**
2. Copy your **Public Key** (e.g., `user_abc123xyz`)

### 5. Update the HTML Files

#### In propietarios.html:
Replace these placeholders around line 320-325:
```javascript
emailjs.init('YOUR_PUBLIC_KEY'); // Replace with your actual public key
emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', formData)
```

With your actual values:
```javascript
emailjs.init('user_abc123xyz'); // Your public key
emailjs.send('service_abc123', 'template_propietarios_xyz', formData)
```

#### In inversionistas.html:
Replace these placeholders around line 290-295:
```javascript
emailjs.init('YOUR_PUBLIC_KEY'); // Replace with your actual public key
emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', formData)
```

With your actual values:
```javascript
emailjs.init('user_abc123xyz'); // Your public key
emailjs.send('service_abc123', 'template_inversionistas_xyz', formData)
```

### 6. Configure Email Destination
In EmailJS template settings, set the **To Email** field to your desired recipient email (e.g., `contacto@aluri.co`)

## Email Format

### Propietarios Email Will Include:
- Nombre Completo
- Correo Electrónico
- Teléfono (with country code)
- Cédula
- Tipo de Propiedad
- Ubicación del Inmueble
- Monto Solicitado
- Información Adicional (optional)

### Inversionistas Email Will Include:
- Nombre Completo
- Correo Electrónico
- Teléfono
- Ciudad
- Monto Disponible para Invertir
- Perfil del Inversionista (optional)

## Features Implemented

✅ **Loading States**: Button shows "Enviando..." while processing
✅ **Success Feedback**: Green checkmark and confirmation alert
✅ **Error Handling**: Red X and error message with fallback email
✅ **Form Reset**: Automatically clears form after successful submission
✅ **User Feedback**: Clear success/error messages
✅ **Disable Double Submit**: Button disabled during submission

## Testing

1. Fill out a form with test data
2. Submit the form
3. Check your configured email inbox
4. You should receive a formatted email with all the form data

## Free Plan Limits

- **200 emails/month** on free plan
- For higher volume, upgrade to EmailJS paid plans
- Alternative: Use Formspree, SendGrid, or implement your own backend

## Troubleshooting

**Email not sending?**
- Check browser console for errors
- Verify your Public Key, Service ID, and Template ID are correct
- Ensure email service is connected in EmailJS dashboard
- Check EmailJS quota (200 emails/month on free plan)

**Receiving spam emails?**
- Add reCAPTCHA to forms (EmailJS supports it)
- Enable email verification in EmailJS settings

## Alternative: Direct mailto Link
If you prefer a simpler solution (opens user's email client instead of sending automatically):
- Replace the EmailJS code with a mailto link
- Example: `mailto:contacto@aluri.co?subject=Solicitud de Crédito&body=...`
- Note: This doesn't format as nicely and requires user to send from their email client
