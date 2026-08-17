from datetime import datetime
from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


# ============================================================
# USER
# ============================================================

class User(db.Model):

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    full_name = db.Column(
        db.String(120),
        nullable=False
    )

    email = db.Column(
        db.String(120),
        unique=True,
        nullable=False
    )

    phone_number = db.Column(
        db.String(30)
    )

    job_title = db.Column(
        db.String(120)
    )

    company = db.Column(
        db.String(150)
    )

    department = db.Column(
        db.String(120)
    )

    employee_id = db.Column(
        db.String(50),
        unique=True
    )

    role = db.Column(
        db.String(50),
        nullable=False,
        default="employee"
    )

    password_hash = db.Column(
        db.String(255),
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    # Relationship
    contracts = db.relationship(
        "Contract",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    def to_dict(self):

        return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "phone_number": self.phone_number,
            "job_title": self.job_title,
            "company": self.company,
            "department": self.department,
            "employee_id": self.employee_id,
            "role": self.role,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            )
        }


# ============================================================
# CONTRACT
# ============================================================

class Contract(db.Model):

    __tablename__ = "contracts"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    name = db.Column(
        db.String(255),
        nullable=False
    )

    file_path = db.Column(
        db.String(500)
    )

    status = db.Column(
        db.String(50),
        nullable=False,
        default="Pending"
    )

    risk = db.Column(
        db.String(20),
        nullable=False,
        default="Pending"
    )

    score = db.Column(
        db.Integer,
        default=0
    )

    completeness = db.Column(
        db.Integer,
        default=0
    )

    high_risk = db.Column(
        db.Integer,
        default=0
    )

    medium_risk = db.Column(
        db.Integer,
        default=0
    )

    low_risk = db.Column(
        db.Integer,
        default=0
    )

    total_clauses = db.Column(
        db.Integer,
        default=0
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    # ========================================================
    # RELATIONSHIPS
    # ========================================================

    user = db.relationship(
        "User",
        back_populates="contracts"
    )

    ai_analyses = db.relationship(
        "AIAnalysis",
        back_populates="contract",
        cascade="all, delete-orphan"
    )

    clauses = db.relationship(
        "ContractClause",
        back_populates="contract",
        cascade="all, delete-orphan"
    )

    summaries = db.relationship(
        "ContractSummary",
        back_populates="contract",
        cascade="all, delete-orphan"
    )

    documents = db.relationship(
        "ContractDocument",
        back_populates="contract",
        cascade="all, delete-orphan"
    )

    parties = db.relationship(
        "ContractParty",
        back_populates="contract",
        cascade="all, delete-orphan"
    )

    analysis_history = db.relationship(
        "AnalysisHistory",
        back_populates="contract",
        cascade="all, delete-orphan"
    )

    def to_dict(self):

        return {
            "id": self.id,
            "name": self.name,

            "date": (
                self.created_at.strftime("%B %d, %Y")
                if self.created_at
                else None
            ),

            "status": self.status,
            "risk": self.risk,
            "score": self.score,
            "completeness": self.completeness,

            "highRisk": self.high_risk,
            "mediumRisk": self.medium_risk,
            "lowRisk": self.low_risk,

            "totalClauses": self.total_clauses,

            "reviewedBy": (
                self.user.full_name
                if self.user
                else None
            ),

            "fileUrl": (
                f"/contracts/{self.id}/file"
                if self.file_path
                else None
            )
        }


# ============================================================
# AI ANALYSIS
# ============================================================

class AIAnalysis(db.Model):

    __tablename__ = "ai_analysis"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    contract_id = db.Column(
        db.Integer,
        db.ForeignKey("contracts.id"),
        nullable=False
    )

    analysis_version = db.Column(
        db.Integer,
        default=1
    )

    overall_score = db.Column(
        db.Integer,
        default=0
    )

    risk_level = db.Column(
        db.String(30),
        default="Pending"
    )

    analysis_status = db.Column(
        db.String(50),
        default="Pending"
    )

    ai_model = db.Column(
        db.String(100)
    )

    analysis_result = db.Column(
        db.Text
    )

    analyzed_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    contract = db.relationship(
        "Contract",
        back_populates="ai_analyses"
    )


# ============================================================
# CONTRACT CLAUSES
# ============================================================

class ContractClause(db.Model):

    __tablename__ = "contract_clauses"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    contract_id = db.Column(
        db.Integer,
        db.ForeignKey("contracts.id"),
        nullable=False
    )

    clause_number = db.Column(
        db.String(50)
    )

    clause_title = db.Column(
        db.String(255)
    )

    clause_text = db.Column(
        db.Text,
        nullable=False
    )

    clause_category = db.Column(
        db.String(100)
    )

    risk_level = db.Column(
        db.String(30),
        default="Low"
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    contract = db.relationship(
        "Contract",
        back_populates="clauses"
    )


# ============================================================
# CONTRACT SUMMARY
# ============================================================

class ContractSummary(db.Model):

    __tablename__ = "contract_summaries"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    contract_id = db.Column(
        db.Integer,
        db.ForeignKey("contracts.id"),
        nullable=False
    )

    executive_summary = db.Column(
        db.Text
    )

    scope_of_work = db.Column(
        db.Text
    )

    payment_terms = db.Column(
        db.Text
    )

    important_dates = db.Column(
        db.Text
    )

    key_obligations = db.Column(
        db.Text
    )

    termination_terms = db.Column(
        db.Text
    )

    generated_by = db.Column(
        db.String(100),
        default="AI"
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    contract = db.relationship(
        "Contract",
        back_populates="summaries"
    )


# ============================================================
# CONTRACT DOCUMENT
# ============================================================

class ContractDocument(db.Model):

    __tablename__ = "contract_documents"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    contract_id = db.Column(
        db.Integer,
        db.ForeignKey("contracts.id"),
        nullable=False
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    contract = db.relationship(
        "Contract",
        back_populates="documents"
    )


# ============================================================
# CONTRACT PARTY
# ============================================================

class ContractParty(db.Model):

    __tablename__ = "contract_parties"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    contract_id = db.Column(
        db.Integer,
        db.ForeignKey("contracts.id"),
        nullable=False
    )

    contract = db.relationship(
        "Contract",
        back_populates="parties"
    )


# ============================================================
# ANALYSIS HISTORY
# ============================================================

class AnalysisHistory(db.Model):

    __tablename__ = "analysis_history"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    contract_id = db.Column(
        db.Integer,
        db.ForeignKey("contracts.id"),
        nullable=False
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    analysis_id = db.Column(
        db.Integer,
        db.ForeignKey("ai_analysis.id")
    )

    action_type = db.Column(
        db.String(50),
        nullable=False
    )

    previous_score = db.Column(
        db.Integer
    )

    new_score = db.Column(
        db.Integer
    )

    previous_risk = db.Column(
        db.String(30)
    )

    new_risk = db.Column(
        db.String(30)
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    contract = db.relationship(
        "Contract",
        back_populates="analysis_history"
    )