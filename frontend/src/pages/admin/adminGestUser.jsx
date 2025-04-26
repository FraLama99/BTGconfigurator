import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Form,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import SideAdmin from "../../component/side/sideAdmin";
import { useAuth } from "../../utlis/AuthContext";
import api from "../../utlis/api";
import UserModal from "../../component/modals/UserModal";
import {
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaUserShield,
  FaUser,
} from "react-icons/fa";
import { toast } from "react-toastify";

const AdminGestUser = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("registrationDate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Recupera la lista degli utenti
  useEffect(() => {
    if (!isAdmin) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await api.getUsers();
        console.log("Utenti recuperati:", response.data);

        // Calcola ordersCount per ogni utente dai dati dell'array 'orders'
        const processedUsers = response.data.map((user) => ({
          ...user,
          ordersCount: user.orders ? user.orders.length : 0,
        }));

        setUsers(processedUsers);
        setFilteredUsers(processedUsers);
      } catch (error) {
        console.error("Errore nel recupero degli utenti:", error);
        toast.error("Errore nel caricamento degli utenti");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAdmin]);

  // Filtra e ordina gli utenti
  useEffect(() => {
    if (!users.length) return;

    // Filtra in base al termine di ricerca
    let result = [...users];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          (user.name && user.name.toLowerCase().includes(term)) ||
          (user.surname && user.surname.toLowerCase().includes(term)) ||
          (user.email && user.email.toLowerCase().includes(term))
      );
    }

    // Ordina gli utenti
    result.sort((a, b) => {
      let valueA, valueB;

      switch (sortField) {
        case "name":
          valueA = `${a.name || ""} ${a.surname || ""}`.toLowerCase();
          valueB = `${b.name || ""} ${b.surname || ""}`.toLowerCase();
          break;
        case "email":
          valueA = (a.email || "").toLowerCase();
          valueB = (b.email || "").toLowerCase();
          break;
        case "role":
          valueA = (a.role || "").toLowerCase();
          valueB = (b.role || "").toLowerCase();
          break;
        case "orders":
          // Usa il valore calcolato ordersCount o la lunghezza dell'array orders
          valueA = a.ordersCount || (a.orders ? a.orders.length : 0);
          valueB = b.ordersCount || (b.orders ? b.orders.length : 0);
          break;
        case "registrationDate":
        default:
          valueA = new Date(a.createdAt || 0);
          valueB = new Date(b.createdAt || 0);
          break;
      }

      // Ordine crescente o decrescente
      const direction = sortDirection === "asc" ? 1 : -1;

      if (valueA < valueB) return -1 * direction;
      if (valueA > valueB) return 1 * direction;
      return 0;
    });

    setFilteredUsers(result);
  }, [users, searchTerm, sortField, sortDirection]);

  // Cambia l'ordinamento
  const handleSortChange = (field) => {
    if (field === sortField) {
      // Se il campo è lo stesso, cambia solo la direzione
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Altrimenti cambia campo e imposta la direzione a decrescente
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Gestisce l'apertura del modale con l'utente selezionato
  const handleUserClick = async (user) => {
    try {
      // Recupera i dati completi dell'utente
      const response = await api.getUserById(user._id);
      if (response && response.data) {
        setSelectedUser(response.data);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Errore nel recupero dei dati utente:", error);
      toast.error("Errore nel caricamento dei dati utente");
    }
  };

  // Aggiorna la lista degli utenti quando il modale si chiude
  const handleUserUpdated = (updatedUser) => {
    if (!updatedUser) return;

    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === updatedUser._id ? { ...user, ...updatedUser } : user
      )
    );
    toast.success("Utente aggiornato con successo");
  };

  // Mostra un messaggio se l'utente non è admin
  if (!isAdmin) {
    return (
      <Container className="py-5 text-center">
        <h1>Accesso non autorizzato</h1>
        <p>Non hai i permessi per accedere a questa pagina.</p>
      </Container>
    );
  }

  return (
    <div className="d-flex">
      <SideAdmin />
      <div
        className="content-wrapper"
        style={{ flex: 1, marginLeft: "250px", padding: "20px" }}
      >
        <Container fluid>
          <h1 className="mb-4">Gestione Utenti</h1>

          {/* Filtri di ricerca e ordinamento */}
          <Row className="mb-4">
            <Col md={6} lg={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Cerca per nome, cognome o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6} lg={8} className="d-flex justify-content-end">
              <div className="d-flex gap-2 flex-wrap">
                <Button
                  variant={sortField === "name" ? "primary" : "outline-primary"}
                  onClick={() => handleSortChange("name")}
                  className="mb-2 mb-md-0"
                >
                  Nome{" "}
                  {sortField === "name" &&
                    (sortDirection === "asc" ? (
                      <FaSortAmountUp />
                    ) : (
                      <FaSortAmountDown />
                    ))}
                </Button>
                <Button
                  variant={
                    sortField === "email" ? "primary" : "outline-primary"
                  }
                  onClick={() => handleSortChange("email")}
                  className="mb-2 mb-md-0"
                >
                  Email{" "}
                  {sortField === "email" &&
                    (sortDirection === "asc" ? (
                      <FaSortAmountUp />
                    ) : (
                      <FaSortAmountDown />
                    ))}
                </Button>
                <Button
                  variant={sortField === "role" ? "primary" : "outline-primary"}
                  onClick={() => handleSortChange("role")}
                  className="mb-2 mb-md-0"
                >
                  Ruolo{" "}
                  {sortField === "role" &&
                    (sortDirection === "asc" ? (
                      <FaSortAmountUp />
                    ) : (
                      <FaSortAmountDown />
                    ))}
                </Button>
                <Button
                  variant={
                    sortField === "registrationDate"
                      ? "primary"
                      : "outline-primary"
                  }
                  onClick={() => handleSortChange("registrationDate")}
                  className="mb-2 mb-md-0"
                >
                  Data registrazione{" "}
                  {sortField === "registrationDate" &&
                    (sortDirection === "asc" ? (
                      <FaSortAmountUp />
                    ) : (
                      <FaSortAmountDown />
                    ))}
                </Button>
                <Button
                  variant={
                    sortField === "orders" ? "primary" : "outline-primary"
                  }
                  onClick={() => handleSortChange("orders")}
                  className="mb-2 mb-md-0"
                >
                  Ordini{" "}
                  {sortField === "orders" &&
                    (sortDirection === "asc" ? (
                      <FaSortAmountUp />
                    ) : (
                      <FaSortAmountDown />
                    ))}
                </Button>
              </div>
            </Col>
          </Row>

          {/* Lista utenti */}
          <Row>
            {loading ? (
              <Col className="text-center py-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Caricamento...</span>
                </Spinner>
              </Col>
            ) : filteredUsers.length === 0 ? (
              <Col className="text-center py-5">
                <p>Nessun utente trovato</p>
              </Col>
            ) : (
              filteredUsers.map((user) => (
                <Col
                  key={user._id}
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  className="mb-4"
                >
                  <Card
                    className="h-100 shadow-sm user-card"
                    onClick={() => handleUserClick(user)}
                    style={{ cursor: "pointer", transition: "transform 0.2s" }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.transform = "scale(1.03)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  >
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <Badge bg={user.role === "admin" ? "danger" : "primary"}>
                        {user.role === "admin" ? (
                          <>
                            <FaUserShield className="me-1" /> Admin
                          </>
                        ) : (
                          <>
                            <FaUser className="me-1" /> Utente
                          </>
                        )}
                      </Badge>
                      {user.ordersCount && (
                        <Badge bg="success">{user.ordersCount} ordini</Badge>
                      )}
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex justify-content-center mb-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={`Avatar di ${user.name || "utente"}`}
                            className="rounded-circle"
                            style={{
                              width: "80px",
                              height: "80px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                            style={{
                              width: "80px",
                              height: "80px",
                              fontSize: "2rem",
                              color: "white",
                            }}
                          >
                            {(
                              user.name?.charAt(0) ||
                              user.email?.charAt(0) ||
                              "?"
                            ).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <Card.Title className="text-center">
                        {user.name && user.surname
                          ? `${user.name} ${user.surname}`
                          : user.name || user.email.split("@")[0]}
                      </Card.Title>
                      <Card.Text className="text-center text-muted">
                        {user.email}
                      </Card.Text>
                      <Card.Text className="text-center">
                        <small className="text-muted">
                          Registrato il{" "}
                          {new Date(user.createdAt).toLocaleDateString("it-IT")}
                        </small>
                      </Card.Text>
                    </Card.Body>
                    <Card.Footer className="text-center">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserClick(user);
                        }}
                      >
                        Gestisci utente
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              ))
            )}
          </Row>

          {/* Modale per la gestione dell'utente */}
          {selectedUser && (
            <UserModal
              show={showModal}
              onHide={() => setShowModal(false)}
              user={selectedUser}
              onUpdate={handleUserUpdated}
            />
          )}
        </Container>
      </div>
    </div>
  );
};

export default AdminGestUser;
