const pool = require('../database/index');

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = `
      INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type)
      VALUES ($1, $2, $3, $4, 'Client')
      RETURNING *
    `;
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
  } catch (error) {
    return error.message;
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
        'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
        [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

async function updateAccount(account_id, account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = `
      UPDATE account
      SET account_firstname = $2, account_lastname = $3, account_email = $4, account_password = $5
      WHERE account_id = $1
      RETURNING *
    `;
    return await pool.query(sql, [account_id, account_firstname, account_lastname, account_email, account_password]);
  } catch (error) {
    return error.message;
  }
}

module.exports = {
  registerAccount,
  getAccountByEmail,
  updateAccount
};