#include "database.hpp"
#include <string>
#include <iostream>

Database::Database(std::string dbName, std::string userName, std::string password, std::string hostAddress, int port)
{
	conn = "dbname = " + dbName + " user = " + userName + " password=" + password + " host=" + hostAddress + " port=" + std::to_string(port);
	try
	{
		pqxx::connection connection(conn);
		if (connection.is_open())
		{
			createTables();
		}
		else
		{
			std::cout << "Can't open database" << std::endl;
		}
	}
	catch (const std::exception &e)
	{
		std::cerr << e.what() << std::endl;
	}
}

bool Database::checkDatabaseAvailable()
{
	try
	{
		pqxx::connection connection(conn);
		//check if connection is good
		if (connection.is_open())
		{
			return true;
		}
		else
		{
			std::cout << "Can't open database" << std::endl;
			return false;
		}
	}
	catch (const std::exception &e)
	{
		std::cerr << e.what() << std::endl;
		return false;
	}
}

//convert bool to string
std::string Database::boolToStr(bool boolean)
{
	if (boolean)
	{
		return "True";
	}
	else
	{
		return "False";
	}
}

//check if entity exists in table
bool Database::checkEntityExist(const std::string &name, const std::string &tableName, const std::string &columnName)
{
	try
	{
		pqxx::connection connection(conn);
		pqxx::work worker(connection);
		std::string sql = "SELECT " + columnName + " from " + tableName + " WHERE " + columnName + "='" + name + "';";

		pqxx::result result{worker.exec(sql)};
		worker.commit();
		connection.close();
		int test = result.size();
		if (result.size() == 0)
		{
			return false;
		}
		else
		{
			return true;
		}
	}
	catch (const std::exception &e)
	{
		std::cerr << e.what() << std::endl;
		return 1;
	}
}

std::string Database::getEntity(std::string select, std::string tableName, std::string columnName, std::string entity)
{
	try
	{
		pqxx::connection connection(conn);
		pqxx::work worker(connection);
		std::string sql = "SELECT " + select + " from " + tableName + " WHERE " + columnName + "='" + entity + "';";

		pqxx::result result{worker.exec(sql)};
		worker.commit();
		int test = result.size();
		for (auto row : result)
		{
			return entity = row[select].c_str();
		}
	}
	catch (const std::exception &e)
	{
		std::cerr << e.what() << std::endl;
	}
}

// create all tables for database
bool Database::createTables()
{
	try
	{
		pqxx::connection connection(conn);
		pqxx::work worker(connection);
		std::string sql =

			"CREATE TABLE IF NOT EXISTS roles ("
			"id SERIAL PRIMARY KEY NOT NULL,"
			"name TEXT NOT NULL,"
			"admin_rights BOOL NOT NULL);"

			"CREATE TABLE IF NOT EXISTS users ("
			"id SERIAL PRIMARY KEY NOT NULL,"
			"name TEXT NOT NULL,"
			"email TEXT NOT NULL,"
			"salt TEXT NOT NULL,"
			"hash TEXT NOT NULL,"
			"role_id INTEGER NOT NULL,"
			"FOREIGN KEY(role_id) REFERENCES roles(id));"

			"CREATE TABLE IF NOT EXISTS language_package ("
			"id SERIAL PRIMARY KEY NOT NULL,"
			"user_id INTEGER NOT NULL,"
			"name TEXT NOT NULL,"
			"foreign_word_language TEXT NOT NULL,"
			"translated_word_language TEXT NOT NULL,"
			"vocabs_per_day INTEGER NOT NULL,"
			"right_words INTEGER NOT NULL,"
			"FOREIGN KEY(user_id) REFERENCES users(id));"

			"CREATE TABLE IF NOT EXISTS drawer ("
			"id SERIAL PRIMARY KEY NOT NULL,"
			"user_id INTEGER NOT NULL,"
			"name TEXT NOT NULL,"
			"query_interval	INTEGER NOT NULL,"
			"language_package_id	INTEGER NOT NULL,"
			"FOREIGN KEY(language_package_id) REFERENCES language_package(id),"
			"FOREIGN KEY(user_id) REFERENCES users(id));"

			"CREATE TABLE IF NOT EXISTS groups ("
			"id SERIAL PRIMARY KEY NOT NULL,"
			"user_id INTEGER NOT NULL,"
			"language_package_id INTEGER NOT NULL,"
			"name	TEXT NOT NULL,"
			"FOREIGN KEY(language_package_id) REFERENCES language_package(id),"
			"FOREIGN KEY(user_id) REFERENCES users(id));"

			"CREATE TABLE IF NOT EXISTS foreign_word ("
			"id SERIAL PRIMARY KEY NOT NULL,"
			"user_id INTEGER NOT NULL,"
			"name	TEXT NOT NULL,"
			"language_package_id	INTEGER NOT NULL,"
			"group_id	INTEGER NOT NULL,"
			"drawer_id	INTEGER NOT NULL,"
			"FOREIGN KEY(language_package_id) REFERENCES language_package(id),"
			"FOREIGN KEY(group_id) REFERENCES groups(id),"
			"FOREIGN KEY(drawer_id) REFERENCES drawer(id),"
			"FOREIGN KEY(user_id) REFERENCES users(id));"

			"CREATE TABLE IF NOT EXISTS translated_word ("
			"id SERIAL PRIMARY KEY NOT NULL,"
			"user_id INTEGER NOT NULL,"
			"foreign_word_id	INTEGER NOT NULL,"
			"name	TEXT NOT NULL,"
			"language_package_id	INTEGER NOT NULL,"
			"FOREIGN KEY(foreign_word_id) REFERENCES foreign_word(id),"
			"FOREIGN KEY(user_id) REFERENCES users(id));";

		worker.exec(sql);
		worker.commit();
		std::cout << "created Tables" << std::endl;
	}
	catch (const std::exception &e)
	{
		std::cerr << e.what() << std::endl;
		return 1;
	}
	return 0;
}

bool Database::checkTableEmpty(const std::string &tableName)
{
	try
	{
		pqxx::connection connection(conn);
		pqxx::work worker(connection);
		//check if any entity is in the table
		std::string sql = "select count(*) from " + tableName + ";";

		pqxx::result result{worker.exec(sql)};
		worker.commit();
		//check if result is 0 -> nothing in the database
		for (auto row : result)
		{
			std::string count = row["count"].c_str();
			if (count == "0")
			{
				return true;
			}
			else
			{
				return false;
			}
		}
	}
	catch (const std::exception &e)
	{
		std::cerr << e.what() << std::endl;
		return 1;
	}
}

bool Database::registerUser(User user)
{
	try
	{
		std::string roleId = "";
		if (user.adminRights)
		{
			roleId = "admin";
		}
		else
		{
			roleId = "user";
		}
		pqxx::connection connection(conn);
		pqxx::work worker(connection);
		std::string sql = "INSERT INTO users (name, email, salt, hash, role_id) VALUES ('" + user.username + "', '" + user.email + "', '" + user.salt + "', '" + user.hash + "', (select id from roles where name = '" + roleId + "'));";

		worker.exec(sql);
		worker.commit();
	}
	catch (const std::exception &e)
	{
		std::cerr << e.what() << std::endl;
		return 1;
	}
}

std::string Database::getUserRole(const std::string &id)
{
	try
	{
		pqxx::connection connection(conn);
		pqxx::work worker(connection);
		std::string sql = "SELECT name from roles WHERE id=(SELECT role_id from users WHERE id='" + id + "');";

		pqxx::result result{worker.exec(sql)};
		worker.commit();
		for (auto row : result)
		{
			return row["name"].c_str();
		}
	}
	catch (const std::exception &e)
	{
		std::cerr << e.what() << std::endl;
	}
}

std::string Database::getHash(const std::string &email)
{
	try
	{
		pqxx::connection connection(conn);
		//get hash from users table with the given email
		pqxx::work worker(connection);
		std::string sql = "SELECT hash from users WHERE email='" + email + "';";

		pqxx::result result{worker.exec(sql)};
		worker.commit();
		//iterate through the result and get the key-value pair with the key 'hash'
		for (auto row : result)
		{
			std::string count = row["hash"].c_str();
			return count;
		}
	}
	catch (const std::exception &e)
	{
		std::cerr << e.what() << std::endl;
	}
}

std::string Database::getSalt(const std::string &email)
{
	try
	{
		pqxx::connection connection(conn);
		//get salt from users table with the given email
		pqxx::work worker(connection);
		std::string sql = "SELECT salt from users WHERE email='" + email + "';";

		pqxx::result result{worker.exec(sql)};
		worker.commit();
		//iterate through the result and get the key-value pair with the key 'salt'
		for (auto row : result)
		{
			std::string count = row["salt"].c_str();
			return count;
		}
	}
	catch (const std::exception &e)
	{
		std::cerr << e.what() << std::endl;
	}
}

bool Database::addRole(const std::string &name, bool adminRights)
{
	try
	{
		pqxx::connection connection(conn);
		pqxx::work worker(connection);
		std::string sql = "INSERT INTO roles (name, admin_rights) VALUES ('" + name + "', '" + boolToStr(adminRights) + "');";

		worker.exec(sql);
		worker.commit();
	}
	catch (const std::exception &e)
	{
		std::cerr << e.what() << std::endl;
		return 1;
	}
	return 0;
}

/*
bool Database::createDrawer(const std::string &name, int queryInterval, const std::string &lngPckgName)
{
	std::string sql = "INSERT INTO drawer (name, query_interval, language_package_id) VALUES (?, ?, (SELECT id FROM language_package WHERE name=?));";
	sqlite3_stmt *addStmt;
	sqlite3_prepare_v2(db, sql.c_str(), -1, &addStmt, NULL);
	sqlite3_bind_text(addStmt, 1, name.c_str(), name.length(), SQLITE_TRANSIENT);
	sqlite3_bind_int(addStmt, 2, queryInterval);
	sqlite3_bind_text(addStmt, 3, lngPckgName.c_str(), lngPckgName.length(), SQLITE_TRANSIENT);

	sqlite3_step(addStmt);
	sqlite3_finalize(addStmt);
	return 0;
}

// check if Entity is already in the database
bool Database::checkExistingEntity(const std::string &name, const std::string &tableName, const std::string &columnName)
{
	std::string sql = "Select * from ? where ? = ?";
	sqlite3_stmt *selectstmt;
	rc = sqlite3_prepare_v2(db, sql.c_str(), -1, &selectstmt, NULL);
	sqlite3_bind_text(selectstmt, 1, tableName.c_str(), tableName.length(), SQLITE_TRANSIENT);
	sqlite3_bind_text(selectstmt, 2, columnName.c_str(), columnName.length(), SQLITE_TRANSIENT);
	sqlite3_bind_text(selectstmt, 3, name.c_str(), name.length(), SQLITE_TRANSIENT);
	if (rc == SQLITE_OK)
	{
		if (sqlite3_step(selectstmt) == SQLITE_ROW)
		{
			// record was found
			return true;
		}
		else
		{
			// no record was found
			return false;
		}
	}
	sqlite3_finalize(selectstmt);
}

void Database::addLanguagePackage(const LanguagePackage &lngPckg)
{
	std::string sql = "INSERT INTO language_package (name, foreign_word_language, translated_word_language, vocabs_per_day, right_words) VALUES(?, ?, ?, ?, ?);";
	sqlite3_stmt *addStmt;
	sqlite3_prepare_v2(db, sql.c_str(), -1, &addStmt, NULL);
	sqlite3_bind_text(addStmt, 1, lngPckg.name.c_str(), lngPckg.name.length(), SQLITE_TRANSIENT);
	sqlite3_bind_text(addStmt, 2, lngPckg.foreignWordLanguage.c_str(), lngPckg.foreignWordLanguage.length(), SQLITE_TRANSIENT);
	sqlite3_bind_text(addStmt, 3, lngPckg.translatedWordLanguage.c_str(), lngPckg.translatedWordLanguage.length(), SQLITE_TRANSIENT);
	sqlite3_bind_int(addStmt, 4, lngPckg.vocabsPerDay);
	sqlite3_bind_int(addStmt, 5, lngPckg.rightWords);

	sqlite3_step(addStmt);
	sqlite3_finalize(addStmt);
}

//return all Language Packages of table
std::vector<std::string> Database::getLanguagePackages()
{
	std::vector<std::string> pckgNames;
	// select every entry, in the table
	sqlite3_stmt *selectStmt;
	rc = sqlite3_prepare_v2(db, "SELECT * FROM language_package", -1, &selectStmt, NULL);
	if (rc != SQLITE_OK)
	{
		std::cerr << "Error preparing statement: " << sqlite3_errmsg;
	}

	// if entity is in database fetch name
	for (;;)
	{
		rc = sqlite3_step(selectStmt);

		if (rc == SQLITE_DONE)
		{
			break;
		}

		if (rc != SQLITE_ROW)
		{
			break;
		}

		const unsigned char *packageName = sqlite3_column_text(selectStmt, 1);
		std::string str_packageName = reinterpret_cast<char const *>(packageName);

		pckgNames.push_back(str_packageName);
	}
	sqlite3_finalize(selectStmt);
	return pckgNames;
}

//------------------------------------------------------------------------------//
//                                    GROUPS                                    //
//------------------------------------------------------------------------------//

void Database::addGroup(const std::string &name, const std::string &lngPckName)
{
	std::string sql = "INSERT INTO groups (language_package_id, name) VALUES ((SELECT id FROM language_package WHERE name=?), ?);";
	sqlite3_stmt *addStmt;
	sqlite3_prepare_v2(db, sql.c_str(), -1, &addStmt, NULL);
	sqlite3_bind_text(addStmt, 1, lngPckName.c_str(), lngPckName.length(), SQLITE_TRANSIENT);
	sqlite3_bind_text(addStmt, 2, name.c_str(), name.length(), SQLITE_TRANSIENT);

	sqlite3_step(addStmt);
	sqlite3_finalize(addStmt);
}

//get group names that belong to a package name
std::vector<std::string> Database::getGroups(std::string packageName)
{
	std::string sql = "SELECT * FROM groups JOIN language_package ON groups.language_package_id = language_package.id Where language_package.name = ? ";
	//get group names with the stored id
	std::vector<std::string> groupNames;
	// select every entry, in the table
	sqlite3_stmt *selectStmt;
	rc = sqlite3_prepare_v2(db, sql.c_str(), -1, &selectStmt, NULL);
	rc = sqlite3_bind_text(selectStmt, 1, packageName.c_str(), packageName.length(), SQLITE_TRANSIENT);
	if (rc != SQLITE_OK)
	{
		std::cerr << "Error preparing statement: " << sqlite3_errmsg;
	}

	// if entity is in database fetch name
	for (;;)
	{
		rc = sqlite3_step(selectStmt);

		if (rc == SQLITE_DONE)
		{
			break;
		}

		if (rc != SQLITE_ROW)
		{
			break;
		}

		const unsigned char *groupName = sqlite3_column_text(selectStmt, 2);
		std::string str_groupName = reinterpret_cast<char const *>(groupName);

		groupNames.push_back(str_groupName);
	}
	sqlite3_finalize(selectStmt);
	return groupNames;
}

//------------------------ ADD FOREIGN WORD ------------------------//

bool Database::addForeignWord(const ForeignWord &lngpckg)
{
	std::string sql = "INSERT INTO language_package (name, language_package_id, group_id, drawer_id) VALUES(?, ?, ?, ?);";
	sqlite3_stmt *addStmt;
	sqlite3_prepare_v2(db, sql.c_str(), -1, &addStmt, NULL);
	sqlite3_bind_text(addStmt, 1, lngpckg.name.c_str(), lngpckg.name.length(), SQLITE_TRANSIENT);
	sqlite3_bind_int(addStmt, 2, lngpckg.languagePackageId);
	sqlite3_bind_int(addStmt, 3, lngpckg.groupId);
	sqlite3_bind_int(addStmt, 4, lngpckg.drawerId);

	rc = sqlite3_step(addStmt);
	sqlite3_finalize(addStmt);
	if (rc != SQLITE_OK)
	{
		return false;
	}
	return true;
}

//------------------------ ADD TRANSLATED WORD ------------------------//

bool Database::addTranslatedWord(const TranslatedWord &lngpckg)
{
	std::string sql = "INSERT INTO language_package (foreign_word_id, name, language_package_id) VALUES(?, ?, ?);";
	sqlite3_stmt *addStmt;
	sqlite3_prepare_v2(db, sql.c_str(), -1, &addStmt, NULL);

	sqlite3_bind_int(addStmt, 1, lngpckg.foreignWordId);
	sqlite3_bind_text(addStmt, 1, lngpckg.name.c_str(), lngpckg.name.length(), SQLITE_TRANSIENT);
	sqlite3_bind_int(addStmt, 3, lngpckg.languagePackageId);

	rc = sqlite3_step(addStmt);
	sqlite3_finalize(addStmt);
	if (rc != SQLITE_OK)
	{
		return false;
	}
	return true;
}
*/