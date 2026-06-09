"""
Custom MySQL backend for Django 6.0 on MariaDB 10.4 (XAMPP).

Django 6.0 requires MariaDB >= 10.6 and uses INSERT … RETURNING syntax
that MariaDB 10.4 does not support.  This backend subclasses the stock
MySQL backend and disables those features so everything works on
XAMPP's MariaDB 10.4.
"""

from django.db.backends.mysql import base as mysql_base
from django.db.backends.mysql import features as mysql_features
from django.db.backends.mysql import operations as mysql_ops


class DatabaseFeatures(mysql_features.DatabaseFeatures):
    """Force-disable all RETURNING-clause support."""

    can_return_columns_from_insert = False
    can_return_rows_from_bulk_insert = False
    can_return_rows_from_update = False

    @property
    def supports_returning(self):
        return False


class DatabaseOperations(mysql_ops.DatabaseOperations):
    """Override returning_clause to always be empty."""

    @property
    def returning_clause(self):
        return ""


class DatabaseWrapper(mysql_base.DatabaseWrapper):
    """Drop-in replacement that uses our patched features / operations
    and bypasses the MariaDB 10.6+ version check."""

    features_class = DatabaseFeatures
    ops_class = DatabaseOperations

    def check_database_version_supported(self):
        """No-op: skip the MariaDB >= 10.6 version check."""
        pass
