const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../../../index");
const req = supertest(app);
const { User } = require("../../../model/usersModel");
const { Customer } = require("../../../model/customerModel");
const { Movie } = require("../../../model/movieModel");
const { Rentals } = require("../../../model/rentalsModel");
const { Genre } = require("../../../model/genresModel");


describe("/rentals/transaction", () =>
{
    it("should return 404 if session aborts", () =>
    {
        // const rental = new Rentals

    })
})