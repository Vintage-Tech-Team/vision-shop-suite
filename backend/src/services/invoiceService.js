import PDFDocument from "pdfkit";

export const generateInvoicePDF = (order, user) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(24).text("Stitch Makers", { align: "left" });
    doc.fontSize(10).text("Invoice", { align: "right" });
    doc.moveDown();

    doc.fontSize(12).text(`Order: ${order.orderNumber}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.text(`Customer: ${user?.name || order.shippingAddress?.fullName}`);
    doc.text(`Email: ${user?.email || "—"}`);
    doc.moveDown();

    doc.text("Shipping Address:");
    const addr = order.shippingAddress;
    if (addr) {
      doc.fontSize(10).text(`${addr.fullName}, ${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`);
    }
    doc.moveDown();

    doc.fontSize(12).text("Items", { underline: true });
    doc.moveDown(0.5);

    order.items.forEach((item) => {
      doc.fontSize(10).text(
        `${item.name || "Product"} — ${item.size} / ${item.color} × ${item.quantity} — $${(item.price * item.quantity).toFixed(2)}`,
      );
    });

    doc.moveDown();
    doc.text(`Subtotal: $${order.subtotal.toFixed(2)}`);
    doc.text(`Shipping: $${order.shippingCost.toFixed(2)}`);
    if (order.discount > 0) doc.text(`Discount: -$${order.discount.toFixed(2)}`);
    doc.fontSize(12).text(`Total: $${order.total.toFixed(2)}`, { bold: true });
    doc.text(`Payment: ${order.paymentMethod.toUpperCase()} — ${order.paymentStatus}`);
    doc.text(`Status: ${order.orderStatus.replace(/_/g, " ")}`);

    doc.end();
  });
