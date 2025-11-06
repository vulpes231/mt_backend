const Account = require("../../models/Account");
const Transaction = require("../../models/Transaction");

async function editTransaction(req, res) {
	const { transactionId } = req.params; // Fixed: should be req.params, not req.param
	const { status } = req.body;

	try {
		const transaction = await Transaction.findById(transactionId);
		if (!transaction) {
			return res.status(404).json({ message: "Transaction not found!" }); // 404 for not found
		}

		// If updating status to failed, reverse the transaction
		if (status && status === "failed") {
			const account = await Account.findOne({
				accountNo: transaction.accountNo,
			});

			if (!account) {
				return res.status(404).json({ message: "Account not found!" });
			}

			console.log("acct bal before reversal", account.balance);

			// Process the reversal based on transaction type
			const processReversal = async (type) => {
				switch (type) {
					case "debit":
						// Debit reversal: add money back to account
						account.balance += transaction.amount;
						await account.save();
						break;
					case "credit":
						// Credit reversal: deduct money from account
						account.balance -= transaction.amount;
						await account.save();
						break;
					case "transfer":
						// For transfers, you might need more complex logic
						// depending on whether this is sender or receiver side
						// This is a simplified version
						account.balance += transaction.amount;
						await account.save();
						break;
					default:
						throw new Error(`Unknown transaction type: ${type}`);
				}
			};

			await processReversal(transaction.type);

			console.log("acct bal after reversal", account.balance);

			// Update transaction status
			transaction.status = status;
			transaction.balance = account.balance;
			await transaction.save();
		} else if (status) {
			// Update status for other status values (completed, pending, etc.)
			transaction.status = status;
			await transaction.save();
		}

		res.status(200).json({
			message: "Transaction updated successfully.",
			success: true,
			data: transaction,
		});
	} catch (error) {
		console.error("Edit transaction error:", error);
		res.status(500).json({
			message: error.message,
			success: false,
			data: null,
		});
	}
}

module.exports = { editTransaction };
