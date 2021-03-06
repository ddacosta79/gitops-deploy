def appstatus
pipeline {
    environment {
        DOMAIN='apps.ocpddc1.os.fyre.ibm.com'
        PRJ="hello-${env.BRANCH_NAME}"
        APP='nodeapp'
        TYPE='dev' // default value is dev
    }
    agent {
      node {
        label 'nodejs'
      }
    }
    stages {
        stage('set env') {
            steps {
                script {
                    if (env.BRANCH_NAME.matches("master")) {
                        PRJ="hello-pro"
                        TYPE='pro'
                        echo("working on PRO")
                    }
                    echo("working on app ${PRJ} in ${TYPE}") 
                }
            }
        }
        stage('create') {
            steps {
                script {
                    // Uncomment to get lots of debugging output
                    //openshift.logLevel(1)
                    openshift.withCluster() {
                        openshift.withProject("${PRJ}"){
                            def appexist = openshift.selector('bc', "${env.APP}").exists()
                        
                        //    echo("Create project ${env.PRJ}")
                        //    openshift.newProject("${env.PRJ}")
                            echo("working to create app ${PRJ} in ${TYPE}")
                            if (!appexist) {
                                echo("Create app ${env.APP}") 
                                openshift.newApp("${env.GIT_URL}#${env.BRANCH_NAME}", "--strategy source", "--name ${env.APP}")
                                //openshift.withProject("${env.PRJ}") {
                                //    echo('Grant to developer admin access to the project')
                                //    openshift.raw('policy', 'add-role-to-group', 'view', 'admins')
                                //    openshift.raw('policy', 'add-role-to-group', 'edit', 'developers')
                                } 
                            else {
                                echo('Project and App already exist')
                                echo('Update the App with new build')
                                appstatus = "update"
                                openshift.withProject("${PRJ}") {
                                    openshift.startBuild("${env.APP}")
                                }
                            }
                        }
                    }
                }
            }
        }
        stage('build') {
            steps {
                script {
                    openshift.withCluster() {
                        openshift.withProject("${PRJ}") {
                            def bc = openshift.selector('bc', "${env.APP}")
                            echo("Wait for build from bc ${env.APP} to finish") 
                            timeout(5) {
                                def builds = bc.related('builds').untilEach(1) {
                                    def phase = it.object().status.phase
                                    if (phase == "Failed" || phase == "Error" || phase == "Cancelled") {
                                        error 'OpenShift build failed or was cancelled'
                                    }
                                    return (phase == "Complete")
                                }
                            }
                        }
                    }
                }
            }
        }
        stage('deploy') {
            steps {
                script {
                    openshift.withCluster() {
                        openshift.withProject("${PRJ}") {
                            if (appstatus != "update") {
                                echo("Expose route for service ${env.APP}") 
                                // Default Jenkins settings to not allow to query properties of an object
                                // So we cannot query the widlcard domain of the ingress controller
                                // Nor the auto genereted host of a route
                                openshift.expose("svc/${env.APP}", "--hostname ${PRJ}.${env.DOMAIN}")
                                echo("Wait for deployment ${env.APP} to finish") 
                                timeout(5) {
                                    openshift.selector('deployment', "${env.APP}").rollout().status()
                                }
                            }
                        }
                    }
                }
            }
        }
        stage('test') {
            input {
                message 'About to test the application'
                ok 'Ok'
            }
            steps {
                echo "Check that '${PRJ}.${env.DOMAIN}' returns HTTP 200"
                sh "curl -s --fail ${PRJ}.${env.DOMAIN}"
            }
        }
    }
}
