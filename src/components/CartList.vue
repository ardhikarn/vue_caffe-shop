<template>
  <b-col
    xl="4"
    lg="6"
    md="8"
    sm="10"
    cols="12"
    class="mx-auto"
    v-if="cart.length > 0"
  >
    <b-card class="mt-3">
      <b-row class="mb-4" v-for="(item, index) in cart" :key="index">
        <b-col cols="4" class="pr-0">
          <img
            v-bind:src="URL + item.product_image"
            class="img-order"
          />
        </b-col>
        <b-col cols="8">
          <div
            class="d-flex flex-column justify-content-between"
            style="height: 100%"
          >
            <h4>
              <strong>{{ item.product_name }}</strong>
            </h4>
            <div cols="12">
              <b-row>
                <b-col cols="6">
                  <button class="px-2 groupBtn" @click="minQty(item)">-</button>
                  <button class="px-0 groupBtn" disabled>
                    {{ item.product_qty }}
                  </button>
                  <button class="px-2 groupBtn" @click="incrementQty(item)">
                    +
                  </button>
                </b-col>
                <b-col cols="6" class="text-right"
                  >Rp. {{ formatRp(item.product_price * item.product_qty) }}</b-col
                >
              </b-row>
            </div>
          </div>
        </b-col>
      </b-row>
      <div class="total-order-price">
        <b-row>
          <b-col cols="7">
            <h5>Total</h5>
            *not include ppn (10%)
          </b-col>
          <b-col cols="5" class="text-right">Rp. {{ formatRp(totalPrice()) }}</b-col>
        </b-row>
      </div>
      <div class="button-checkout">
        <div>
          <b-button class="text-white mt-3 py-2 my-2" @click="addDataOrder()"
            >Checkout</b-button
          >
        </div>
        <b-button class="text-white py-2 my-2" @click="cancelOrder()"
          >Cancel</b-button
        >
      </div>
      <!-- MODAL CONFIRM -->
      <b-modal hide-footer ref="modal-confirm" title="Are You Sure ?">
        <div class="text-right">
          <b-button @click="$refs['modal-confirm'].hide()">Cancel</b-button>
          <b-button @click="postOrder(cart)" class="ml-2" variant="success"
            >OK</b-button
          >
        </div>
      </b-modal>

      <!-- MODAL CHECKOUT -->
      <b-modal hide-footer ref="modal-checkout" title="CHECKOUT SUCCESS">
        <b-row class="mb-2">
          <b-col lg="6" class="text-left">Cashier : {{ user.user_name }}</b-col>
          <b-col lg="6" class="text-right">Receipt no: #{{ invoice }}</b-col>
        </b-row>
        <div class="modal-content">
          <div class="modal-body">
            <b-row v-for="(item, index) in cart" :key="index">
              <b-col lg="8" class="text-left">
                <p>
                  {{ item.product_name }} {{ item.product_qty }}x (@Rp. {{
                    formatRp(item.product_price)
                  }})
                </p>
              </b-col>
              <b-col lg="4" class="text-right">
                <p>Rp. {{formatRp(item.product_price * item.product_qty)}}</p>
              </b-col>
            </b-row>
            <b-row>
              <b-col lg="6" class="text-left">Ppn 10%</b-col>
              <b-col lg="6" class="text-right">
                Rp. {{ formatRp(totalPrice() * 0.1) }}
                <hr />
              </b-col>
              <b-col lg="12" class="text-right"
                >Total : Rp. {{ formatRp(totalPrice() + totalPrice() * 0.1) }}</b-col
              >
              <b-col lg="12" class="text-left">Payment : Cash</b-col>
            </b-row>
            <div class="button-checkout">
              <b-button @click="printCheckout" class="text-white mt-3 py-2 my-2"
                >Print Checkout</b-button
              >
              <p class="mb-0 text-center">Or</p>
              <b-button class="text-white py-2 my-2" @click="$refs['modal-sendEmail'].show()"
                >Send Email</b-button
              >
            </div>
          </div>
        </div>
      </b-modal>

      <b-modal hide-footer ref="modal-sendEmail" title="SEND TO EMAIL">
        <form ref="form" @submit.prevent="onSubmit">
          <b-form-group
            label="Email"
            label-for="email-input"
            invalid-feedback="Email is required"
          >
            <b-form-input
              type="email"
              id="email-input"
              required
              v-model="form.user_email"
            ></b-form-input>
          </b-form-group>
          <div class="text-right">
            <b-button @click="$refs['modal-sendEmail'].hide()">Cancel</b-button>
            <b-button type="submit" class="ml-2" variant="success">OK</b-button>
          </div>
        </form>
      </b-modal>
    </b-card>
  </b-col>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import Jspdf from 'jspdf'

export default {
  name: 'CartList',
  data() {
    return {
      addOrders: [],
      URL: process.env.VUE_APP_URL,
      form: {}
    }
  },
  created() {},
  computed: {
    ...mapGetters({ cart: 'getCart', user: 'getUser', invoice: 'getInvoice' })
  },
  methods: {
    ...mapMutations([
      'removeCart',
      'incrementQty',
      'decrementQty',
      'cancelOrder'
    ]),
    ...mapActions(['postOrders', 'sendEmailOrder']),
    minQty(data) {
      if (data.product_qty === 1) {
        this.removeCart(data)
      } else {
        this.decrementQty(data)
      }
    },
    totalPrice() {
      let total = 0
      for (let i = 0; i < this.cart.length; i++) {
        total += this.cart[i].product_price * this.cart[i].product_qty
      }
      return total
    },
    addDataOrder(data) {
      this.$refs['modal-confirm'].show()
    },
    postOrder(data) {
      for (let i = 0; i < data.length; i++) {
        const dataOrders = {
          product_id: data[i].product_id,
          order_qty: data[i].product_qty
        }
        this.addOrders = [...this.addOrders, dataOrders]
      }
      const setDataOrder = {
        user_id: this.user.user_id,
        orders: this.addOrders
      }
      this.postOrders(setDataOrder)
        .then(response => {
          this.$refs['modal-checkout'].show()
          this.$refs['modal-confirm'].hide()
          this.makeToast('success', 'Success', 'Order Success')
        })
        .catch(error => {
          this.makeToast('danger', 'Error', error)
        })
    },
    printCheckout() {
      const doc = new Jspdf()
      doc.setFont('helvetica')
      doc.setFontSize(12)
      doc.text('- Rythz POS -', 10, 10)
      doc.text(`Date : ${new Date().toJSON().slice(0, 10)}`, 160, 10)
      doc.text('CHECKOUT SUCCESS', 80, 30)
      doc.text(`Cashier : ${this.user.user_name}`, 20, 40)
      doc.text(`Receipt no : #${this.invoice}`, 140, 40)
      doc.text('Orders : ', 20, 50)
      const itemOrders = []
      for (var i in this.cart) {
        itemOrders.push(`${this.cart[i].product_name} ${this.cart[i].product_qty}x (@Rp. ${this.formatRp(this.cart[i].product_price)})`)
      }
      const qtyOrders = []
      for (var j in this.cart) {
        qtyOrders.push(`Rp. ${this.formatRp(this.cart[j].product_price * this.cart[j].product_qty)}`)
      }
      const dist = itemOrders.length * 5
      doc.text(itemOrders, 37, 50)
      doc.text(qtyOrders, 140, 50)
      doc.text('PPN (10%) : ', 20, 60 + dist)
      doc.text(`Rp. ${this.formatRp(this.totalPrice() * 0.1)}`, 140, 60 + dist)
      doc.text('Total Price : ', 20, 70 + dist)
      doc.text(`Rp. ${this.formatRp(this.totalPrice() + (this.totalPrice() * 0.1))}`, 140, 70 + dist)
      doc.text('THANK YOU FOR COMING', 76, 80 + dist)
      doc.save('pdf.pdf')
      this.$refs['modal-checkout'].hide()
      this.cancelOrder()
      this.makeToast('success', 'Rythz-POS', 'Thank You For Coming')
    },
    onSubmit() {
      const emailOrder = {
        user_email: this.form.user_email
      }
      this.sendEmailOrder(emailOrder)
        .then((result) => {
          this.$refs['modal-checkout'].hide()
          this.$refs['modal-sendEmail'].hide()
          this.makeToast('success', 'Success', 'Success Send Email')
          this.cancelOrder()
        })
        .catch((error) => {
          this.makeToast('danger', 'Error', error.response)
        })
    },
    makeToast(variant, title, message) {
      this.$bvToast.toast(message, {
        title: title,
        variant: variant,
        solid: true
      })
    },
    formatRp(value) {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    }
  }
}
</script>
