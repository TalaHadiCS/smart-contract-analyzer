# ============================================================
# SANAD - CONTRACT ANALYZER FLASK BACKEND
# ============================================================

import os
import json
import random
import threading

from datetime import datetime

from flask import (
    Flask,
    request,
    jsonify,
    send_from_directory
)

from flask_cors import CORS

from werkzeug.utils import secure_filename

from models import (
    db,
    User,
    Contract,
    AIAnalysis,
    ContractClause,
    ContractSummary,
    AnalysisHistory,
)

from auth import (
    hash_password,
    verify_password
)

from ai.gemini_analyzer import analyze_contract


# ============================================================
# CREATE FLASK APP
# ============================================================

app = Flask(__name__)

CORS(app)


# ============================================================
# DATABASE CONFIGURATION
# ============================================================

app.config["SQLALCHEMY_DATABASE_URI"] = (
    "mysql+pymysql://root:Tota1400@localhost/contractai"
)

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)


# ============================================================
# UPLOAD CONFIGURATION
# ============================================================

UPLOAD_FOLDER = os.path.join(
    os.path.dirname(
        os.path.abspath(__file__)
    ),
    "uploads"
)

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

app.config["MAX_CONTENT_LENGTH"] = (
    50 * 1024 * 1024
)


# ============================================================
# CREATE TABLES
# ============================================================

with app.app_context():
    db.create_all()


# ============================================================
# SAFE GET
# ============================================================

def safe_get(data, key, default):

    value = data.get(key)

    if value is None or value == "":

        return default

    return value


# ============================================================
# NORMALIZE STATUS
# ============================================================

def get_contract_status(contract):

    status = getattr(
        contract,
        "status",
        None
    )

    if not status:

        return "Analyzing"

    return status


# ============================================================
# SIGN UP
# ============================================================

@app.route(
    "/signup",
    methods=["POST"]
)
def signup():

    data = request.get_json() or {}

    full_name = data.get(
        "full_name",
        ""
    ).strip()

    email = data.get(
        "email",
        ""
    ).strip().lower()

    password = data.get(
        "password",
        ""
    )

    phone_number = data.get(
        "phone_number",
        ""
    ).strip()

    job_title = data.get(
        "job_title",
        ""
    ).strip()

    company = data.get(
        "company",
        ""
    ).strip()

    department = data.get(
        "department",
        ""
    ).strip()

    employee_id = data.get(
        "employee_id",
        ""
    ).strip()

    role = "employee"


    if not full_name or not email or not password:

        return jsonify({
            "error": (
                "Full name, email, and password "
                "are required."
            )
        }), 400


    existing_user = User.query.filter_by(
        email=email
    ).first()


    if existing_user:

        return jsonify({
            "error": (
                "An account with this email "
                "already exists."
            )
        }), 409


    if employee_id:

        existing_employee = (
            User.query
            .filter_by(
                employee_id=employee_id
            )
            .first()
        )

        if existing_employee:

            return jsonify({
                "error": (
                    "An account with this Employee "
                    "ID already exists."
                )
            }), 409


    new_user = User(

        full_name=full_name,

        email=email,

        phone_number=(
            phone_number
            or None
        ),

        job_title=(
            job_title
            or None
        ),

        company=(
            company
            or None
        ),

        department=(
            department
            or None
        ),

        employee_id=(
            employee_id
            or None
        ),

        role=role,

        password_hash=hash_password(
            password
        )
    )


    db.session.add(
        new_user
    )

    db.session.commit()


    return jsonify({

        "message": "Account created.",

        "user": new_user.to_dict()

    }), 201


# ============================================================
# LOGIN
# ============================================================

@app.route(
    "/login",
    methods=["POST"]
)
def login():

    data = request.get_json() or {}

    email = data.get(
        "email",
        ""
    ).strip().lower()

    password = data.get(
        "password",
        ""
    )


    user = User.query.filter_by(
        email=email
    ).first()


    if not user or not verify_password(
        password,
        user.password_hash
    ):

        return jsonify({
            "error": (
                "Invalid email or password."
            )
        }), 401


    return jsonify({

        "message": "Logged in.",

        "user": user.to_dict()

    }), 200


# ============================================================
# GET USER
# ============================================================

@app.route(
    "/user/<int:user_id>",
    methods=["GET"]
)
def get_user(user_id):

    user = db.session.get(
        User,
        user_id
    )


    if not user:

        return jsonify({
            "error": "User not found."
        }), 404


    return jsonify({

        "user": user.to_dict()

    }), 200


# ============================================================
# UPDATE USER
# ============================================================

@app.route(
    "/user/<int:user_id>",
    methods=["PUT"]
)
def update_user(user_id):

    user = db.session.get(
        User,
        user_id
    )


    if not user:

        return jsonify({
            "error": "User not found."
        }), 404


    data = request.get_json() or {}


    full_name = data.get(
        "full_name"
    )

    if full_name is not None:

        full_name = full_name.strip()

        if not full_name:

            return jsonify({
                "error": (
                    "Full name cannot be empty."
                )
            }), 400

        user.full_name = full_name


    email = data.get(
        "email"
    )

    if email is not None:

        email = email.strip().lower()

        if not email:

            return jsonify({
                "error": (
                    "Email cannot be empty."
                )
            }), 400


        existing_user = (
            User.query
            .filter(
                User.email == email,
                User.id != user.id
            )
            .first()
        )


        if existing_user:

            return jsonify({
                "error": (
                    "An account with this "
                    "email already exists."
                )
            }), 409


        user.email = email


    phone_number = data.get(
        "phone_number"
    )

    if phone_number is not None:

        user.phone_number = (
            phone_number.strip()
            or None
        )


    job_title = data.get(
        "job_title"
    )

    if job_title is not None:

        user.job_title = (
            job_title.strip()
            or None
        )


    company = data.get(
        "company"
    )

    if company is not None:

        user.company = (
            company.strip()
            or None
        )


    department = data.get(
        "department"
    )

    if department is not None:

        user.department = (
            department.strip()
            or None
        )


    employee_id = data.get(
        "employee_id"
    )

    if employee_id is not None:

        employee_id = employee_id.strip()


        if employee_id:

            existing_employee = (
                User.query
                .filter(
                    User.employee_id == employee_id,
                    User.id != user.id
                )
                .first()
            )


            if existing_employee:

                return jsonify({
                    "error": (
                        "This Employee ID "
                        "is already in use."
                    )
                }), 409


        user.employee_id = (
            employee_id
            or None
        )


    db.session.commit()


    return jsonify({

        "message": (
            "Profile updated successfully."
        ),

        "user": user.to_dict()

    }), 200


# ============================================================
# BACKGROUND AI ANALYSIS
# ============================================================

def analyze_contract_background(
    flask_app,
    contract_id,
    save_path
):

    with flask_app.app_context():

        try:

            print()
            print(
                "=========================================="
            )

            print(
                "AI ANALYSIS STARTED"
            )

            print(
                "Contract ID:",
                contract_id
            )

            print(
                "=========================================="
            )


            # =================================================
            # GET CONTRACT
            # =================================================

            contract = db.session.get(
                Contract,
                contract_id
            )


            if not contract:

                print(
                    "Contract no longer exists."
                )

                return


            # =================================================
            # ANALYZING STATUS
            # =================================================

            contract.status = "Analyzing"

            db.session.commit()


            # =================================================
            # RUN GEMINI
            # =================================================

            analysis = analyze_contract(
                save_path
            )


            if not isinstance(
                analysis,
                dict
            ):

                raise ValueError(
                    "AI returned an invalid analysis result."
                )


            print()
            print(
                "=========================================="
            )

            print(
                "GEMINI ANALYSIS COMPLETED"
            )

            print(
                "Risk:",
                analysis.get("risk")
            )

            print(
                "Score:",
                analysis.get("score")
            )

            print(
                "Completeness:",
                analysis.get(
                    "completeness"
                )
            )

            print(
                "Clauses:",
                analysis.get(
                    "total_clauses"
                )
            )

            print(
                "=========================================="
            )


            # =================================================
            # GET CONTRACT AGAIN
            # =================================================

            contract = db.session.get(
                Contract,
                contract_id
            )


            if not contract:

                return


            # =================================================
            # UPDATE CONTRACT
            # =================================================

            contract.status = "Analyzed"

            contract.risk = safe_get(
                analysis,
                "risk",
                "Pending"
            )

            contract.score = safe_get(
                analysis,
                "score",
                0
            )

            contract.completeness = safe_get(
                analysis,
                "completeness",
                0
            )

            contract.high_risk = safe_get(
                analysis,
                "high",
                0
            )

            contract.medium_risk = safe_get(
                analysis,
                "medium",
                0
            )

            contract.low_risk = safe_get(
                analysis,
                "low",
                0
            )

            contract.total_clauses = safe_get(
                analysis,
                "total_clauses",
                0
            )


            db.session.flush()


            # =================================================
            # AI ANALYSIS RECORD
            # =================================================

            ai_analysis = AIAnalysis(

                contract_id=contract.id,

                analysis_version=1,

                overall_score=safe_get(
                    analysis,
                    "score",
                    0
                ),

                risk_level=safe_get(
                    analysis,
                    "risk",
                    "Pending"
                ),

                analysis_status="Completed",

                ai_model="Gemini",

                analysis_result=json.dumps(
                    analysis,
                    ensure_ascii=False
                ),

                analyzed_at=datetime.utcnow()
            )


            db.session.add(
                ai_analysis
            )

            db.session.flush()


            # =================================================
            # CONTRACT SUMMARY
            # =================================================

            contract_summary = ContractSummary(

                contract_id=contract.id,

                executive_summary=safe_get(
                    analysis,
                    "summary",
                    "Not specified"
                ),

                scope_of_work=safe_get(
                    analysis,
                    "scope_of_work",
                    "Not specified"
                ),

                payment_terms=safe_get(
                    analysis,
                    "payment_terms",
                    "Not specified"
                ),

                important_dates=safe_get(
                    analysis,
                    "duration_and_dates",
                    "Not specified"
                ),

                key_obligations=safe_get(
                    analysis,
                    "responsibilities",
                    "Not specified"
                ),

                termination_terms=safe_get(
                    analysis,
                    "commercial_requirements",
                    "Not specified"
                ),

                generated_by="Gemini"
            )


            db.session.add(
                contract_summary
            )


            # =================================================
            # RISKS
            # =================================================

            risks = analysis.get(
                "risks",
                []
            )


            if isinstance(
                risks,
                list
            ):

                for index, risk_item in enumerate(
                    risks,
                    start=1
                ):

                    if isinstance(
                        risk_item,
                        dict
                    ):

                        level = safe_get(
                            risk_item,
                            "level",
                            "Low"
                        )

                        clause = safe_get(
                            risk_item,
                            "clause",
                            f"Risk {index}"
                        )

                        description = safe_get(
                            risk_item,
                            "description",
                            ""
                        )

                    else:

                        level = "Low"

                        clause = (
                            f"Risk {index}"
                        )

                        description = str(
                            risk_item
                        )


                    clause_record = ContractClause(

                        contract_id=contract.id,

                        clause_number=str(
                            index
                        ),

                        clause_title=clause,

                        clause_text=description,

                        clause_category="Risk",

                        risk_level=level
                    )


                    db.session.add(
                        clause_record
                    )


            # =================================================
            # MISSING / WEAK CLAUSES
            # =================================================

            missing_clauses = analysis.get(
                "missing_or_weak_clauses",
                []
            )


            if isinstance(
                missing_clauses,
                list
            ):

                for index, missing_clause in enumerate(
                    missing_clauses,
                    start=1
                ):

                    clause_record = ContractClause(

                        contract_id=contract.id,

                        clause_number=f"M-{index}",

                        clause_title=(
                            "Missing / Weak Clause"
                        ),

                        clause_text=str(
                            missing_clause
                        ),

                        clause_category=(
                            "Missing / Weak"
                        ),

                        risk_level="Medium"
                    )


                    db.session.add(
                        clause_record
                    )


            # =================================================
            # ANALYSIS HISTORY
            # =================================================

            history = AnalysisHistory(

                contract_id=contract.id,

                user_id=contract.user_id,

                analysis_id=ai_analysis.id,

                action_type="INITIAL_ANALYSIS",

                previous_score=None,

                new_score=safe_get(
                    analysis,
                    "score",
                    0
                ),

                previous_risk=None,

                new_risk=safe_get(
                    analysis,
                    "risk",
                    "Pending"
                )
            )


            db.session.add(
                history
            )


            # =================================================
            # COMMIT EVERYTHING
            # =================================================

            db.session.commit()


            print()
            print(
                "=========================================="
            )

            print(
                "CONTRACT ANALYSIS SAVED SUCCESSFULLY"
            )

            print(
                "Contract ID:",
                contract_id
            )

            print(
                "=========================================="
            )


        except Exception as e:

            print()
            print(
                "=========================================="
            )

            print(
                "AI ANALYSIS FAILED"
            )

            print(
                "Contract ID:",
                contract_id
            )

            print(
                "Error:",
                str(e)
            )

            print(
                "=========================================="
            )


            db.session.rollback()


            # =================================================
            # MARK CONTRACT AS FAILED
            # =================================================

            try:

                contract = db.session.get(
                    Contract,
                    contract_id
                )


                if contract:

                    contract.status = (
                        "Analysis Failed"
                    )

                    db.session.commit()


            except Exception as status_error:

                db.session.rollback()

                print(
                    "Could not update failed status:",
                    str(status_error)
                )


# ============================================================
# UPLOAD CONTRACT
# ============================================================

@app.route(
    "/contracts",
    methods=["POST"]
)
def upload_contract():

    user_id = request.form.get(
        "user_id"
    )

    file = request.files.get(
        "file"
    )


    # ========================================================
    # VALIDATE USER
    # ========================================================

    if not user_id:

        return jsonify({
            "error": "user_id is required."
        }), 400


    try:

        user_id = int(user_id)

    except (ValueError, TypeError):

        return jsonify({
            "error": "Invalid user_id."
        }), 400


    user = db.session.get(
        User,
        user_id
    )


    if not user:

        return jsonify({
            "error": "User not found."
        }), 404


    # ========================================================
    # VALIDATE FILE
    # ========================================================

    if not file or file.filename == "":

        return jsonify({
            "error": "No file uploaded."
        }), 400


    if not file.filename.lower().endswith(
        ".pdf"
    ):

        return jsonify({
            "error": (
                "Only PDF files are supported."
            )
        }), 400


    # ========================================================
    # SAVE FILE
    # ========================================================

    original_filename = secure_filename(
        file.filename
    )


    unique_filename = (
        f"{user_id}_"
        f"{int(random.random() * 1_000_000)}_"
        f"{original_filename}"
    )


    save_path = os.path.join(
        app.config["UPLOAD_FOLDER"],
        unique_filename
    )


    try:

        file.save(
            save_path
        )

    except Exception as e:

        return jsonify({

            "error": "Could not save the uploaded file.",

            "details": str(e)

        }), 500


    # ========================================================
    # CREATE CONTRACT IMMEDIATELY
    #
    # IMPORTANT:
    # We do NOT wait for Gemini here.
    # ========================================================

    new_contract = Contract(

        user_id=user.id,

        name=original_filename,

        file_path=unique_filename,

        status="Analyzing",

        risk="Pending",

        score=0,

        completeness=0,

        high_risk=0,

        medium_risk=0,

        low_risk=0,

        total_clauses=0
    )


    try:

        db.session.add(
            new_contract
        )

        db.session.commit()


    except Exception as e:

        db.session.rollback()


        if os.path.exists(
            save_path
        ):

            try:

                os.remove(
                    save_path
                )

            except OSError:

                pass


        print(
            "Contract creation error:",
            str(e)
        )


        return jsonify({

            "error": (
                "Could not create the contract."
            ),

            "details": str(e)

        }), 500


    contract_id = new_contract.id


    # ========================================================
    # START AI ANALYSIS IN BACKGROUND
    # ========================================================

    analysis_thread = threading.Thread(

        target=analyze_contract_background,

        args=(
            app,
            contract_id,
            save_path
        ),

        daemon=True
    )


    analysis_thread.start()


    # ========================================================
    # RETURN IMMEDIATELY
    # ========================================================

    return jsonify({

        "message": (
            "Contract uploaded successfully. "
            "AI analysis has started."
        ),

        "contract": new_contract.to_dict(),

        "analysis": {

            "status": "Analyzing",

            "message": (
                "The contract is being analyzed "
                "by AI. Please wait."
            )

        }

    }), 202


# ============================================================
# LIST USER CONTRACTS
# ============================================================

@app.route(
    "/contracts",
    methods=["GET"]
)
def list_contracts():

    user_id = request.args.get(
        "user_id"
    )


    if not user_id:

        return jsonify({
            "error": "user_id is required."
        }), 400


    try:

        user_id = int(user_id)

    except (ValueError, TypeError):

        return jsonify({
            "error": "Invalid user_id."
        }), 400


    contracts = (

        Contract.query

        .filter_by(
            user_id=user_id
        )

        .order_by(
            Contract.created_at.desc()
        )

        .all()
    )


    contract_list = []


    for contract in contracts:

        contract_data = contract.to_dict()

        contract_data["analysis_status"] = (
            get_contract_status(contract)
        )

        contract_list.append(
            contract_data
        )


    return jsonify({

        "contracts": contract_list

    }), 200


# ============================================================
# GET SINGLE CONTRACT
# ============================================================

@app.route(
    "/contracts/<int:contract_id>",
    methods=["GET"]
)
def get_contract(contract_id):

    contract = db.session.get(
        Contract,
        contract_id
    )


    if not contract:

        return jsonify({
            "error": "Contract not found."
        }), 404


    contract_data = contract.to_dict()

    contract_data["analysis_status"] = (
        get_contract_status(contract)
    )


    return jsonify({

        "contract": contract_data

    }), 200


# ============================================================
# GET ORIGINAL CONTRACT FILE
# ============================================================

@app.route(
    "/contracts/<int:contract_id>/file",
    methods=["GET"]
)
def get_contract_file(
    contract_id
):

    contract = db.session.get(
        Contract,
        contract_id
    )


    if not contract or not contract.file_path:

        return jsonify({
            "error": "File not found."
        }), 404


    full_path = os.path.join(
        app.config["UPLOAD_FOLDER"],
        contract.file_path
    )


    if not os.path.exists(
        full_path
    ):

        return jsonify({
            "error": (
                "This contract's file is missing "
                "from storage."
            )
        }), 404


    return send_from_directory(

        app.config[
            "UPLOAD_FOLDER"
        ],

        contract.file_path
    )


# ============================================================
# DELETE CONTRACT
# ============================================================

@app.route(
    "/contracts/<int:contract_id>",
    methods=["DELETE"]
)
def delete_contract(contract_id):

    contract = db.session.get(
        Contract,
        contract_id
    )


    if not contract:

        return jsonify({
            "error": "Contract not found."
        }), 404


    # ========================================================
    # DELETE FILE
    # ========================================================

    if contract.file_path:

        file_path = os.path.join(
            app.config["UPLOAD_FOLDER"],
            contract.file_path
        )


        if os.path.exists(
            file_path
        ):

            try:

                os.remove(
                    file_path
                )

            except OSError as e:

                print(
                    "Could not remove contract file:",
                    str(e)
                )


    # ========================================================
    # DELETE DATABASE RECORD
    # ========================================================

    try:

        db.session.delete(
            contract
        )

        db.session.commit()


    except Exception as e:

        db.session.rollback()


        return jsonify({

            "error": (
                "Could not delete the contract."
            ),

            "details": str(e)

        }), 500


    return jsonify({

        "message": (
            "Contract deleted successfully."
        )

    }), 200


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":

    app.run(
        debug=True
    )