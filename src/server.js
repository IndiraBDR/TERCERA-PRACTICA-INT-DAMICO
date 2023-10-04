import express from "express";
import { routerProduct } from "./routes/products.router.js";
import { routerCart } from "./routes/cart.router.js";
//import { handlebars } from "express-handlebars";
import { engine } from "express-handlebars";
import { __dirname } from "./utils.js";
import { routerViews } from "./routes/views.router.js";
import { Server } from "socket.io";

import { ProductManager } from "../src/productManager.js";

const productManager = new ProductManager();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

app.use("/api/products", routerProduct);

app.use("/api/carts", routerCart);

app.use("/api/views", routerViews);

const httpServer = app.listen(8080, () => {
  console.log("LEYENDO PUERTO 8080");
});

const socketServer = new Server(httpServer);

socketServer.on("connection", async (socket) => {
  const productosOld = await productManager.getProduct();

  socket.emit("productsInitial", productosOld);

  socket.on("addProduct", async (product) => {
    const producto = await productManager.addProduct(product);

    const productosActualizados = await productManager.getProduct();

    socket.emit("productUpdate", productosActualizados);

    console.log(product);
  });

  socket.on("deleteProduct", async (productId) => {
    const productosOld = await productManager.getProduct();

    const producto = await productManager.deleteProductById(+productId);

    const productosActualizados = await productManager.getProduct();

    socket.emit("productDelete", productosActualizados);

    console.log(producto);
  });


});
