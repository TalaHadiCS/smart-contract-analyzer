# ============================================================
# clear_all_contracts.py
#
# One-time cleanup script: deletes every contract for every
# user (and everything that hangs off a contract - AI analysis,
# clauses, summaries, history) AND removes the matching PDF
# files from backend/uploads/. User accounts are left alone.
#
# Run this from the same folder as app.py:
#     python clear_all_contracts.py
#
# It will ask for confirmation before deleting anything.
# ============================================================

import os

from flask import Flask

from models import db, Contract


app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = (
    "mysql+pymysql://root:Tota1400@localhost/contractai"
)

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)


UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "uploads"
)


with app.app_context():

    contracts = Contract.query.all()

    if not contracts:
        print("No contracts found. Nothing to delete.")
        raise SystemExit

    print(f"Found {len(contracts)} contract(s).")

    confirm = input(
        "Type DELETE to permanently remove all of them: "
    )

    if confirm.strip() != "DELETE":
        print("Cancelled. Nothing was deleted.")
        raise SystemExit

    removed_files = 0
    missing_files = 0

    for contract in contracts:

        if contract.file_path:

            file_path = os.path.join(
                UPLOAD_FOLDER,
                contract.file_path
            )

            if os.path.exists(file_path):
                os.remove(file_path)
                removed_files += 1
            else:
                missing_files += 1

        # cascade="all, delete-orphan" in models.py takes care
        # of ai_analysis / contract_clauses / contract_summaries
        # / contract_documents / contract_parties /
        # analysis_history for us.
        db.session.delete(contract)

    db.session.commit()

    print(f"Deleted {len(contracts)} contract(s) from the database.")
    print(f"Removed {removed_files} file(s) from disk.")

    if missing_files:
        print(f"({missing_files} file(s) were already missing on disk.)")
