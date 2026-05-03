const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const mongoose = require("mongoose");

const getUserTransactions = async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(400).json({ message: "Bad request!" });

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 10);
  const sortBy = req.query.sortBy || "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
  const filterBy = req.query.filterBy;
  const filterValue = req.query.filterValue;

  try {
    const sort = {};
    const filter = { receiver: userId };

    if (filterBy && filterValue) {
      if (filterBy === "status") {
        filter.status = { $in: filterValue.split(",") };
      } else if (filterBy === "type") {
        filter.type = { $in: filterValue.split(",") };
      } else {
        filter[filterBy] = filterValue;
      }
    }

    if (sortBy === "date" || sortBy === "time") {
      sort["createdAt"] = sortOrder;
    } else {
      sort[sortBy] = sortOrder;
    }

    const userTransactions = await Transaction.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalItems = await Transaction.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      data: userTransactions,
      success: true,
      message: "User transactions fetched successfully.",
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalItems,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get user transactions error:", error);
    res.status(500).json({
      message: "Internal server error",
      data: null,
      success: false,
    });
  }
};

const getAccountTransaction = async (req, res) => {
  const userId = req.userId;
  if (!userId)
    return res.status(401).json({ message: "You're not logged in." });
  const { accountId } = req.params;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(10, parseInt(req.query.limit) || 10);
  const { sortBy, filterBy, filterValue } = req.query;

  try {
    const sort = {};
    if (sortBy) {
      sort[sortBy] = -1;
    }

    const filter = { userId, accountId };
    if (filterBy && filterValue) {
      filter[filterBy] = filterValue;
    }

    const trnxs = await Transaction.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    const totalItems = await Transaction.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      data: trnxs,
      success: true,
      message: "Account transactions fetched succesfully.",
      pagination: {
        currentPage: page,
        totalPage: totalPages,
        totalItem: totalItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
      data: null,
      success: false,
    });
  }
};

module.exports = {
  getUserTransactions,
  getAccountTransaction,
};
