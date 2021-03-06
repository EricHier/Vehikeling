<template>
  <div class="custom-card">
    <img alt="Bild des Autos" class="w-full rounded" v-bind:src="car.images.length === 0 ? '' : car.images[0]" width="100%"/>
    <div class="relative m-4">
      <h4 class="text-3xl mb-2 font-semibold">{{car.name.length !== 0 ? car.name : (car.hersteller.length !== 0 ? car.hersteller + " "  + car.model : car.model )}}</h4>
      <p>
        <span v-if="car.kennzeichen !== ''">Kennzeichen: {{car.kennzeichen}} <br></span>
        <span v-if="car.name.length !== 0">{{car.hersteller + " " + car.model}}</span>
      </p>
      <p v-if="details">
        <span v-if="car.baujahr !== ''">Baujahr: {{car.baujahr}} <br></span>
        <span v-if="car.color !== ''">Farbe: {{car.color}} <br></span>
        <span v-if="car.fahrgestellnummer !== ''">Fahrgestellnummer: {{car.fahrgestellnummer}} <br></span>
        <span v-if="car.specs !== ''">Eigenschaften: {{car.specs}}</span>
      </p>
      <img class="absolute h-5 w-5 top-0 right-0 print-disable" src="../../static/delete.png"  v-bind:class="{'rounded-sm invert bg-green-600' : deleteActive}" v-on:click="deleteCar"
           v-show="details" alt="Delete Car" />
      <img class="absolute h-5 w-5 top-7 right-0 print-disable" src="../../static/edit.png" v-on:click="editCar" v-show="details" alt="Edit Car" />
    </div>
    <AddCar class="print-disable" v-bind:car="car" v-if="editActive" v-on:click="preventClick"
            v-on:close="editActive = false" v-on:setCurrentCar="setCurrentCar"></AddCar>
  </div>
</template>

<script>
    import {auth, db, storage} from "../../services/firebase";
    import AddCar from "../popups/AddCar";

    export default {
        name: 'Car',
        components: {AddCar},
        props: ["car", "details"],
        data() {
            return {
                deleteActive: false,
                editActive: false,
                currentCar: {}
            }
        },
        methods: {
            preventClick(e) {
                e.preventDefault()
            },

            deleteCollection(db, collectionRef, batchSize) {
                let query = collectionRef.orderBy('__name__').limit(batchSize);

                return new Promise((resolve, reject) => {
                    this.deleteQueryBatch(db, query, batchSize, resolve, reject);
                });
            },
            deleteQueryBatch(db, query, batchSize, resolve, reject) {
                query.get()
                    .then((snapshot) => {
                        // When there are no documents left, we are done
                        if (snapshot.size === 0) {
                            return 0;
                        }

                        // Delete documents in a batch
                        let batch = db.batch();
                        snapshot.docs.forEach((doc) => {
                            batch.delete(doc.ref);
                        });

                        return batch.commit().then(() => {
                            return snapshot.size;
                        });
                    }).then((numDeleted) => {
                    if (numDeleted === 0) {
                        resolve();
                        return;
                    }

                    // Recurse on the next process tick, to avoid
                    // exploding the stack.
                    process.nextTick(() => {
                        this.deleteQueryBatch(db, query, batchSize, resolve, reject);
                    });
                })
                    .catch(reject);
            },


            deleteCar(e) {
              e.preventDefault();
              if (this.deleteActive) {
                if (auth.currentUser === null)
                  return;

                let self = this;
                let uid = auth.currentUser.uid;

                this.deleteCollection(db, db.collection("user").doc(uid).collection("cars").doc(self.car.id).collection("services"), 1000);
                db.collection("user").doc(uid).collection("cars").doc(self.car.id).delete();
                self.car.images.forEach(async function (image) {
                  storage.refFromURL(image).delete();
                });
                this.$router.push("/cars");

              } else {
                this.deleteActive = true;

                setTimeout(() => {
                  this.deleteActive = false;
                }, 1000);
              }
            },
            editCar(e) {
                e.preventDefault();
                e.stopPropagation();

                let self = this;
                self.editActive = true;
            },
            setCurrentCar(e) {
                this.currentCar = e;
            }
        }
    }
</script>
