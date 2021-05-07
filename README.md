# Demo for workshop


# run locally

 docker run -dit --name my-hello -p 8080:8080  demo/nodejshello:1.0


# run on openshift

oc new-app --docker-image demo/nodejshello:1.0
