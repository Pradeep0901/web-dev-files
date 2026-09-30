pipeline {
    agent any

    options {
        timestamps()
        timeout(time: 1, unit: 'HOURS')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    parameters {
        string(name: 'TARGET_URL', defaultValue: 'http://localhost:8080', description: 'Target URL to validate')
        choice(name: 'VALIDATION_TYPE', choices: ['STATUS_CODE', 'RESPONSE_TIME', 'CONTENT_CHECK'], description: 'Type of HTTP validation')
        string(name: 'EXPECTED_CODE', defaultValue: '200', description: 'Expected HTTP status code')
        string(name: 'TIMEOUT_SECONDS', defaultValue: '30', description: 'Request timeout in seconds')
    }

    environment {
        BUILD_TIMESTAMP = sh(script: "date '+%Y-%m-%d_%H-%M-%S'", returnStdout: true).trim()
        REPORT_DIR = "reports/${BUILD_TIMESTAMP}"
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Checking out source code..."
                checkout scm
            }
        }

        stage('Prepare Environment') {
            steps {
                echo "Preparing validation environment..."
                sh '''
                    mkdir -p ${REPORT_DIR}
                    echo "Target URL: ${TARGET_URL}"
                    echo "Validation Type: ${VALIDATION_TYPE}"
                    echo "Expected Status Code: ${EXPECTED_CODE}"
                '''
            }
        }

        stage('HTTP Status Code Validation') {
            when {
                expression { params.VALIDATION_TYPE == 'STATUS_CODE' }
            }
            steps {
                echo "Validating HTTP Status Code..."
                script {
                    try {
                        def response = sh(
                            script: """
                                curl -s -o /dev/null -w "%{http_code}" \
                                --max-time ${TIMEOUT_SECONDS} \
                                "${TARGET_URL}"
                            """,
                            returnStdout: true
                        ).trim()
                        
                        echo "HTTP Response Code: ${response}"
                        
                        if (response == params.EXPECTED_CODE) {
                            echo "✓ Status code validation PASSED"
                        } else {
                            error "✗ Status code validation FAILED: Expected ${params.EXPECTED_CODE}, got ${response}"
                        }
                    } catch (Exception e) {
                        error "Failed to reach URL: ${e.message}"
                    }
                }
            }
        }

        stage('Response Time Validation') {
            when {
                expression { params.VALIDATION_TYPE == 'RESPONSE_TIME' }
            }
            steps {
                echo "Validating Response Time..."
                script {
                    try {
                        def responseTime = sh(
                            script: """
                                curl -s -o /dev/null -w "%{time_total}" \
                                --max-time ${TIMEOUT_SECONDS} \
                                "${TARGET_URL}"
                            """,
                            returnStdout: true
                        ).trim()
                        
                        echo "Response Time: ${responseTime} seconds"
                        
                        if (responseTime.toFloat() < 5.0) {
                            echo "✓ Response time is acceptable (< 5 seconds)"
                        } else {
                            echo "⚠ Warning: Response time is slow (>= 5 seconds)"
                        }
                    } catch (Exception e) {
                        error "Failed to validate response time: ${e.message}"
                    }
                }
            }
        }

        stage('Content Check Validation') {
            when {
                expression { params.VALIDATION_TYPE == 'CONTENT_CHECK' }
            }
            steps {
                echo "Validating Response Content..."
                script {
                    try {
                        sh """
                            curl -s --max-time ${TIMEOUT_SECONDS} "${TARGET_URL}" > ${REPORT_DIR}/response.html
                            
                            if grep -q "html\\|body" ${REPORT_DIR}/response.html; then
                                echo "✓ Content validation PASSED - HTML content detected"
                            else
                                echo "⚠ Warning: Expected HTML content not found"
                            fi
                        """
                    } catch (Exception e) {
                        error "Failed to validate content: ${e.message}"
                    }
                }
            }
        }

        stage('Generate Report') {
            steps {
                echo "Generating validation report..."
                sh '''
                    cat > ${REPORT_DIR}/validation_report.txt <<EOF
HTTP Validation Report
======================
Build Number: ${BUILD_NUMBER}
Build URL: ${BUILD_URL}
Timestamp: ${BUILD_TIMESTAMP}

Configuration
--------------
Target URL: ${TARGET_URL}
Validation Type: ${VALIDATION_TYPE}
Expected Status Code: ${EXPECTED_CODE}
Timeout: ${TIMEOUT_SECONDS} seconds

Status: SUCCESS
Report generated at: ${REPORT_DIR}
EOF
                    cat ${REPORT_DIR}/validation_report.txt
                '''
            }
        }
    }

    post {
        always {
            echo "Archiving validation reports..."
            archiveArtifacts artifacts: 'reports/**/*', allowEmptyArchive: true
            
            cleanWs(
                deleteDirs: true,
                patterns: [
                    [pattern: 'reports/**', type: 'INCLUDE']
                ]
            )
        }

        success {
            echo "✓ Pipeline executed successfully"
            echo "Reports available at: ${REPORT_DIR}"
        }

        failure {
            echo "✗ Pipeline failed - HTTP validation did not pass"
        }

        unstable {
            echo "⚠ Pipeline marked as unstable"
        }
    }
}
